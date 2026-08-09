import json
import base64
import urllib.request
import urllib.parse
from typing import List
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import google.generativeai as genai

# Load .env from repo root
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass  # dotenv optional; fall back to system env vars

SUPABASE_URL      = os.environ.get("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")  # backend-only, never exposed
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GROQ_API_KEY   = os.environ.get("GROQ_API_KEY", "")
# ── Feature A: Tavily (server-side only — NEVER exposed to frontend via /config or any response) ──
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")
# ── Feature B: n8n webhook URL (safe to expose via /config — it is a URL, not a credential) ──
N8N_WEBHOOK_URL = os.environ.get("N8N_WEBHOOK_URL", "")
# ── Feature B: recipient email (backend-only — NEVER exposed to frontend) ──
NOTIFY_EMAIL = os.environ.get("NOTIFY_EMAIL", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# ── Groq client (text simplify + summarise + vision OCR) ─────────────────
groq_client = None
if GROQ_API_KEY:
    try:
        from groq import Groq
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("Groq client initialised.")
    except ImportError:
        print("groq package not installed. Run: pip install groq")

app = FastAPI(title="Indriya - Inclusive Classroom Backend")


# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Public config endpoint (safe — anon key only, no service key) ─────────────
@app.get("/config")
def get_config():
    """Expose public Supabase credentials and n8n webhook URL to frontend.
    Service key and Tavily API key are NEVER included."""
    return JSONResponse({
        "supabaseUrl":     SUPABASE_URL,
        "supabaseAnonKey": SUPABASE_ANON_KEY,
        "n8nWebhookUrl":   N8N_WEBHOOK_URL,   # Feature B: safe URL, not a secret
    })


class ConnectionManager:

    def __init__(self):
        # Keep track of active connections categorized by student type / teacher
        self.active_connections: List[WebSocket] = []

    async def accept(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Send json message to all active WebSocket clients
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                # Handle dead connections gracefully
                print(f"Error sending message to client: {e}")

manager = ConnectionManager()

# ── Language Detection ────────────────────────────────────────────────────────
@app.get("/detect-lang")
def detect_lang(text: str):
    """
    Detect whether input text is Hindi ('hi') or English ('en').
    Uses Google Translate's public language detection endpoint.
    Returns { lang: 'hi' | 'en', confidence: float }
    """
    import re

    # Fast path: Devanagari characters → definitely Hindi
    if re.search(r'[\u0900-\u097F]', text):
        return JSONResponse({"lang": "hi", "confidence": 1.0, "source": "devanagari"})

    # Call Google Translate unofficial detection endpoint (no API key needed)
    try:
        encoded = urllib.parse.quote(text[:200])  # cap at 200 chars
        url = (
            f"https://translate.googleapis.com/translate_a/single"
            f"?client=gtx&sl=auto&tl=en&dt=t&q={encoded}"
        )
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0"
        })
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read())
        # Response format: [[translations...], null, detected_lang, ...]
        detected = data[2] if len(data) > 2 else "en"
        lang = "hi" if detected in ("hi", "ur") else "en"
        return JSONResponse({"lang": lang, "confidence": 0.95, "source": "google"})
    except Exception as e:
        print(f"Language detection fallback: {e}")
        # Fallback: basic Hinglish word check
        hinglish = {"namaste","namaskar","aaj","kal","haan","nahi","kitab","shikshak",
                    "padhna","likhna","dhanyawad","shukriya","madad","achha","kaise","kyun"}
        words = set(text.lower().split())
        if words & hinglish:
            return JSONResponse({"lang": "hi", "confidence": 0.75, "source": "hinglish"})
        return JSONResponse({"lang": "en", "confidence": 0.5, "source": "fallback"})


# ───────────────────────────────────────────────────────────────────
# F1.1  /api/simplify   — Groq Llama 3.3 (ISL sentence simplifier)
# ───────────────────────────────────────────────────────────────────
@app.post("/api/simplify")
async def simplify_sentence(request: dict):
    """
    Simplify a complex academic sentence for ISL translation.
    POST body: { "text": "Photosynthesis is the biochemical process..." }
    Returns:   { "simplified": "PLANT SUNLIGHT FOOD MAKE", "source": "groq" | "passthrough" }
    Degrades gracefully: returns original text if Groq key is missing.
    """
    text = request.get("text", "").strip()
    if not text:
        return {"simplified": "", "source": "empty"}

    if not groq_client:
        return {"simplified": text, "source": "passthrough", "note": "GROQ_API_KEY not set"}

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an ISL (Indian Sign Language) sentence simplifier for Indian classrooms. "
                        "Rewrite the user's sentence using simple, short, common English words likely to have ISL gesture equivalents. "
                        "Use Subject-Object-Verb (SOV) word order. Remove articles (a, an, the), auxiliary verbs (is, are, was, were), "
                        "and filler words. Use ALL CAPS. Output ONLY the simplified sentence — no explanation, no punctuation."
                    )
                },
                {"role": "user", "content": text}
            ],
            max_tokens=80,
            temperature=0.2
        )
        simplified = response.choices[0].message.content.strip()
        return {"simplified": simplified, "original": text, "source": "groq"}
    except Exception as e:
        print(f"Groq /api/simplify error: {e}")
        return {"simplified": text, "source": "fallback", "error": str(e)}


# ───────────────────────────────────────────────────────────────────
# F1.2  /api/summarise  — Groq Mixtral (lesson transcript → 5 revision bullets)
# ───────────────────────────────────────────────────────────────────
@app.post("/api/summarise")
async def summarise_lesson(request: dict):
    """
    Summarise a full classroom session transcript into 5 revision bullet points.
    POST body: { "transcript": "full session text as one string..." }
    Returns:   { "summary": "• Point 1\n• Point 2...", "source": "groq" | "error" }
    """
    transcript = request.get("transcript", "").strip()
    if len(transcript) < 30:
        return {"summary": "Not enough content to summarise. Continue the session and try again.", "source": "error"}

    if not groq_client:
        return {"summary": "Groq API key not configured. Add GROQ_API_KEY to your .env file.", "source": "error"}

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a classroom assistant for Indian school students. "
                        "Summarise the following classroom lecture transcript into EXACTLY 5 bullet points "
                        "suitable for student revision. Each point should start with a bullet '•'. "
                        "Use simple, clear language. Be factual. No introduction or conclusion text — just the 5 bullets."
                    )
                },
                {"role": "user", "content": f"Summarise this classroom session:\n\n{transcript[:6000]}"}
            ],
            max_tokens=350,
            temperature=0.3
        )
        summary = response.choices[0].message.content.strip()
        return {"summary": summary, "source": "groq"}
    except Exception as e:
        print(f"Groq /api/summarise error: {e}")
        return {"summary": "Error generating summary. Please try again.", "source": "fallback", "error": str(e)}


@app.post("/api/board-ocr")
async def board_ocr(file: UploadFile = File(...)):
    """
    Extract text from a whiteboard/blackboard image.
    Primary:  Groq Qwen 3.6 27B Vision (handles handwriting + Hindi + diagrams)
    Fallback: Gemini 2.0 Flash Vision
    """
    contents = await file.read()
    extracted_text = ""
    source_used = "none"

    # ── PRIMARY: Groq Qwen Vision ───────────────────────────────────
    if groq_client:
        try:
            b64_image = base64.b64encode(contents).decode("utf-8")
            mime = file.content_type or "image/jpeg"
            response = groq_client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "This is a photo of a classroom whiteboard or blackboard. "
                                "Extract ALL visible text including: Hindi (Devanagari script), English, "
                                "numbers, formulas, headings, and bullet points. "
                                "Preserve the structure and reading order. "
                                "Return ONLY the extracted text — no commentary, no explanation."
                            )
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime};base64,{b64_image}"}
                        }
                    ]
                }],
                max_tokens=1024
            )
            extracted_text = response.choices[0].message.content.strip()
            source_used = "groq-llama4-vision"
            print(f"Board OCR via Groq Llama 4 Vision: {len(extracted_text)} chars extracted")
        except Exception as e:
            print(f"Groq Vision OCR error: {e}")
            extracted_text = ""

    # ── FALLBACK: Gemini 2.0 Flash Vision ─────────────────────────
    if not extracted_text and GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel("gemini-2.0-flash")
            prompt = (
                "Perform OCR on this whiteboard image. Extract all text accurately "
                "including Hindi and English. Preserve layout. Return ONLY the extracted text."
            )
            response = model.generate_content([prompt, {"mime_type": file.content_type, "data": contents}])
            extracted_text = response.text.strip()
            source_used = "gemini-fallback"
            print(f"Board OCR via Gemini fallback: {len(extracted_text)} chars extracted")
        except Exception as e:
            print(f"Gemini fallback OCR error: {e}")
            extracted_text = "OCR failed. Please check API key configuration."
            source_used = "error"

    if not extracted_text:
        extracted_text = "Mock OCR: Add GROQ_API_KEY to .env to enable live board reading."
        source_used = "mock"

    # Broadcast to all connected students via WebSocket
    await manager.broadcast({"type": "board_note", "text": extracted_text})
    return {"status": "success", "extracted_text": extracted_text, "source": source_used}


# ── Feature A: Tavily "Ask the Web" ─────────────────────────────────────────
# SECURITY: TAVILY_API_KEY is read from env and used server-side only.
# It is NEVER returned to the frontend in any response.
@app.post("/api/tavily-search")
async def tavily_search(request: dict):
    """
    Search the live web via Tavily API. The API key remains strictly server-side.
    POST body: { "query": "photosynthesis" }
    Returns:   { "results": [{ "title": "...", "url": "...", "content": "..." }] }
    Returns empty results list for blank queries or missing API key — never errors loudly.
    """
    query = request.get("query", "").strip()
    if not query:
        return {"results": []}
    if not TAVILY_API_KEY:
        print("Tavily: TAVILY_API_KEY not set. Add it to .env to enable live web search.")
        return {"results": [], "error": "Web search not configured on server. Add TAVILY_API_KEY to .env."}
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.tavily.com/search",
                json={"query": query, "max_results": 3, "search_depth": "basic"},
                headers={"Authorization": f"Bearer {TAVILY_API_KEY}"},
                timeout=8.0
            )
            res.raise_for_status()
        data = res.json()
        return {"results": data.get("results", [])}
    except Exception as e:
        print(f"Tavily search error: {e}")
        return {"results": [], "error": "Search unavailable. Please try again."}



# ── Feature B: n8n Parent Notifications proxy ────────────────────────────────
# Proxies the lesson summary to the n8n production webhook server-side.
# This avoids CORS issues that occur when the browser POSTs directly to n8n.
# N8N_WEBHOOK_URL is read from env; it is never hardcoded.
# toEmail is provided per-request by the frontend (stored in browser localStorage).
@app.post("/api/notify-parents")
async def notify_parents(request: dict):
    """
    Forward a lesson summary to the configured n8n webhook.
    POST body: { "toEmail": "...", "summary": "...", "timestamp": "...", "subjectMode": "..." }
    toEmail is supplied per-request by the frontend (from browser localStorage).
    The backend validates toEmail, generates the subject, and forwards the payload
    so n8n expressions {{ $json.body.toEmail }} and {{ $json.body.subject }} resolve correctly.
    Returns: { "status": "ok" } on success, or an error dict on failure.
    """
    if not N8N_WEBHOOK_URL:
        return JSONResponse(
            {"error": "N8N_WEBHOOK_URL not configured on server. Add it to .env."},
            status_code=503
        )

    # Validate toEmail from request body
    import re
    to_email = request.get("toEmail", "").strip()
    if not to_email:
        return JSONResponse(
            {"error": "toEmail is required. Please enter a parent/guardian email address."},
            status_code=400
        )
    # Basic RFC-style email format check (rejects obviously malformed addresses)
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", to_email):
        return JSONResponse(
            {"error": "toEmail is not a valid email address."},
            status_code=400
        )

    try:
        import httpx
        # Build the subject from available data — no hardcoded personal info
        timestamp = request.get("timestamp", "")
        subject_mode = request.get("subjectMode", "general").capitalize()
        date_part = timestamp[:10] if timestamp else ""  # "YYYY-MM-DD"
        subject = f"Indriya – {subject_mode} Lesson Summary"
        if date_part:
            subject += f" ({date_part})"

        # Build outgoing payload: forward all frontend fields + inject subject
        # toEmail comes from the request body (frontend localStorage) — not from server env
        outgoing = dict(request)          # preserves summary, timestamp, subjectMode, toEmail
        outgoing["subject"] = subject     # required by n8n {{ $json.body.subject }}
        # Ensure toEmail is the validated, stripped value
        outgoing["toEmail"] = to_email    # required by n8n {{ $json.body.toEmail }}

        async with httpx.AsyncClient() as client:
            res = await client.post(
                N8N_WEBHOOK_URL,
                json=outgoing,
                headers={"Content-Type": "application/json"},
                timeout=10.0
            )
            res.raise_for_status()
        return {"status": "ok"}
    except Exception as e:
        print(f"n8n notify-parents error: {e}")
        return JSONResponse({"error": str(e)}, status_code=502)


@app.websocket("/ws/student/{mode}")
async def websocket_endpoint(websocket: WebSocket, mode: str):
    await manager.accept(websocket)
    print(f"Client joined classroom. Mode: {mode}")
    try:
        while True:
            # Wait for incoming messages from clients (e.g. Speech text from teacher)
            data = await websocket.receive_text()
            message_obj = json.loads(data)
            
            if message_obj.get("type") == "speech_input":
                # Broadcast teacher's transcription to all connected student screens
                lang = message_obj.get("lang", "en")
                print(f"Broadcasting speech input [{lang}]: {message_obj['text']}")
                await manager.broadcast({
                    "type": "broadcast",
                    "text": message_obj["text"],
                    "lang": lang
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client left classroom. Mode: {mode}")

# Mount static frontend files to easily run everything in one server
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend"))
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
else:
    @app.get("/")
    def read_root():
        return {"status": "Backend running, frontend directory not found locally"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
