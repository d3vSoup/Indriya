# Indriya — AI Features Implementation Guide

> This document tells you **what to build next**, **which API to use**, **where to get the key**, **how to plug it in**, and **how to update the `.env.example`**. No fluff. Just steps.

---

## 🗺️ The AI Stack at a Glance

| Feature | Where it runs | API / Tool | Mode |
|---|---|---|---|
| Sentence Simplification (real-time) | Backend | **Groq** (Llama 3.3 70B) | Deaf |
| Lesson Summarisation (end of class) | Backend | **Groq** (Mixtral 8x7B) | Both |
| Board OCR (whiteboard → text) | Backend | **Qwen3-VL** via Together AI | Both |
| Language Detection | Backend | Google Translate (free, no key) | Both |
| Emotion / Tone Overlay | Frontend only | Web Audio API (no key needed) | Deaf |
| Two-Way Sign Recognition | Frontend only | MediaPipe Hands (free CDN) | Deaf |
| Silent Handshake (mode detection) | Frontend only | No API — pure JS logic | Both |

---

## 🔑 Feature 1 — Sentence Simplification (Groq)

### What it does
Before the teacher's words are sent to the deaf student as ISL signs, run them through an LLM that rewrites complex sentences into simple, ISL-friendly vocabulary.

> *"Photosynthesis is the biochemical process..."* → **"PLANT SUNLIGHT FOOD MAKE"**

### Which API
**Groq Cloud** — fastest open-source LLM inference on the planet. Uses Llama 3.3 70B. Free tier generous.

### How to get the key
1. Go to **https://console.groq.com/keys**
2. Sign up / log in.
3. Click **"Create API Key"**.
4. Copy the key (it starts with `gsk_...`).

### Where to paste it
In your `.env` file at the repo root:
```
GROQ_API_KEY=gsk_your_key_here
```

### How to update `.env.example`
Add this block below the Gemini section:
```
# ── Groq (Sentence Simplification + Lesson Summarisation) ────────────────────
# Get from https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here
```

### Backend code to add in `backend/main.py`
Install the SDK first:
```bash
pip install groq
```

Add this to `main.py`:
```python
from groq import Groq

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

@app.post("/api/simplify")
async def simplify_sentence(request: dict):
    """
    Simplify a complex academic sentence for ISL translation.
    POST body: { "text": "Photosynthesis is..." }
    Returns: { "simplified": "PLANT SUNLIGHT FOOD MAKE" }
    """
    if not groq_client:
        return {"simplified": request.get("text", ""), "source": "passthrough"}

    text = request.get("text", "")
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an ISL (Indian Sign Language) sentence simplifier. "
                        "Rewrite the input as short, common words in SOV (Subject-Object-Verb) order. "
                        "Remove articles, auxiliary verbs, and filler words. "
                        "Use ALL CAPS. Output ONLY the simplified sentence."
                    )
                },
                {"role": "user", "content": text}
            ],
            max_tokens=100,
            temperature=0.3
        )
        simplified = response.choices[0].message.content.strip()
        return {"simplified": simplified, "source": "groq"}
    except Exception as e:
        print(f"Groq simplify error: {e}")
        return {"simplified": text, "source": "fallback"}
```

### Where to call it in the frontend (`deaf.html`)
Call `/api/simplify` **before** running ISL lookup on the teacher's spoken text:
```javascript
async function getSimplifiedText(rawText) {
    const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText })
    });
    const data = await res.json();
    return data.simplified; // Use this for ISL sign lookup instead of rawText
}
```

---

## 🔑 Feature 2 — Lesson Summarisation (Groq)

### What it does
At the end of a class, hit a "Summarise Lesson" button. It sends the entire session transcript (already stored in `localStorage`) to Groq and gets back 5 clean revision bullet points.

### Which API
**Groq Cloud** — same key as Feature 1. Use `mixtral-8x7b-32768` for its long context window.

### No new key needed — same `GROQ_API_KEY`.

### Backend code to add in `backend/main.py`
```python
@app.post("/api/summarise")
async def summarise_lesson(request: dict):
    """
    Summarise a full classroom session transcript.
    POST body: { "transcript": "full session text..." }
    Returns: { "summary": "• Point 1\n• Point 2..." }
    """
    if not groq_client:
        return {"summary": "Groq API key not configured.", "source": "error"}

    transcript = request.get("transcript", "")
    if len(transcript) < 50:
        return {"summary": "Not enough content to summarise.", "source": "error"}

    try:
        response = groq_client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a classroom assistant. Summarise the following classroom lecture "
                        "transcript into exactly 5 bullet points suitable for student revision notes. "
                        "Be concise and factual. Use simple language."
                    )
                },
                {"role": "user", "content": transcript}
            ],
            max_tokens=400,
            temperature=0.4
        )
        summary = response.choices[0].message.content.strip()
        return {"summary": summary, "source": "groq"}
    except Exception as e:
        print(f"Groq summarise error: {e}")
        return {"summary": "Error generating summary.", "source": "fallback"}
```

### Where to call it in the frontend (`deaf.html` and `blind.html`)
Add a "Summarise" button. On click:
```javascript
async function summariseSession() {
    // Pull full session from localStorage
    const transcript = sessionLog.map(e => e.text).join(". ");

    const res = await fetch('/api/summarise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
    });
    const data = await res.json();
    // Display summary in a modal or panel
    showSummaryModal(data.summary);
    // For blind mode: speak it aloud
    speak(data.summary);
}
```

---

## 🔑 Feature 3 — Board OCR via Qwen3-VL (Together AI)

### What it does
Teacher points their phone/webcam at the whiteboard. The image is sent to Qwen3-VL which extracts all text (including handwriting + Hindi + diagrams). The extracted text is then broadcast:
- **Blind student**: TTS reads it aloud.
- **Deaf student**: ISL engine renders signs.

### Which API
**Together AI** — hosts Qwen3-VL-72B. Free credits on signup. After that, very cheap.

### How to get the key
1. Go to **https://www.together.ai/**
2. Sign up (free — they give you $25 in free credits on signup).
3. Go to **Settings → API Keys → Create API Key**.
4. Copy the key (starts with `tgp_...`).

### Where to paste it
In your `.env` file:
```
TOGETHER_API_KEY=tgp_your_key_here
```

### How to update `.env.example`
Add this block:
```
# ── Together AI (Qwen3-VL Board OCR — Open Source Vision) ────────────────────
# Free $25 credits on signup: https://www.together.ai/
# Used for whiteboard/blackboard text extraction via Qwen3-VL-72B
TOGETHER_API_KEY=your_together_api_key_here
```

### Backend code — replace the existing Gemini OCR in `main.py`
Install the SDK:
```bash
pip install together
```

Modify the existing `/api/board-ocr` endpoint:
```python
import base64
from together import Together

TOGETHER_API_KEY = os.environ.get("TOGETHER_API_KEY", "")
together_client = Together(api_key=TOGETHER_API_KEY) if TOGETHER_API_KEY else None

@app.post("/api/board-ocr")
async def board_ocr(file: UploadFile = File(...)):
    contents = await file.read()
    extracted_text = ""

    if together_client:
        # Primary: Qwen3-VL via Together AI
        try:
            b64_image = base64.b64encode(contents).decode("utf-8")
            mime = file.content_type or "image/jpeg"

            response = together_client.chat.completions.create(
                model="Qwen/Qwen3-VL-72B-Instruct",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    "This is a photo of a classroom whiteboard or blackboard. "
                                    "Extract ALL text you can see, including Hindi (Devanagari), "
                                    "English, numbers, formulas, and headings. Preserve the structure. "
                                    "Return ONLY the extracted text, no commentary."
                                )
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime};base64,{b64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1024
            )
            extracted_text = response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Together/Qwen3-VL OCR Error: {e}")
            # Fallback to Gemini if configured
            if GEMINI_API_KEY:
                try:
                    model = genai.GenerativeModel("gemini-2.0-flash")
                    response = model.generate_content([
                        "Extract all text from this whiteboard image. Return only the text.",
                        {"mime_type": file.content_type, "data": contents}
                    ])
                    extracted_text = response.text.strip()
                except Exception as e2:
                    print(f"Gemini fallback OCR Error: {e2}")
                    extracted_text = "OCR failed. Check API keys."
            else:
                extracted_text = "OCR unavailable. Configure TOGETHER_API_KEY."
    elif GEMINI_API_KEY:
        # Secondary: Gemini Vision as fallback
        try:
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content([
                "Extract all text from this whiteboard image. Return only the text.",
                {"mime_type": file.content_type, "data": contents}
            ])
            extracted_text = response.text.strip()
        except Exception as e:
            print(f"Gemini OCR Error: {e}")
            extracted_text = "Error performing OCR."
    else:
        extracted_text = "Mock OCR: configure TOGETHER_API_KEY or GEMINI_API_KEY."

    await manager.broadcast({"type": "board_note", "text": extracted_text})
    return {"status": "success", "extracted_text": extracted_text}
```

### Pitch angle
> "We use **Qwen3-VL-72B** — the current open-source SOTA for screen and document understanding, running on Together AI infrastructure. If Together AI is unavailable, we automatically fall back to Gemini Vision. **Zero single point of failure.**"

---

## 🔑 Feature 4 — Emotion / Tone Overlay (No API Needed)

### What it does
Analyses the teacher's microphone audio in real-time using the **Web Audio API** (built into every browser). Detects pitch + volume → shows a coloured border on the ISL viewer:
- 🔴 **Urgent / Loud** → Red pulsing border
- 💙 **Calm / Quiet** → Blue ambient glow
- 💛 **Excited / Fast** → Gold sparkle animation

### Which API
**None** — native `AudioContext` + `AnalyserNode`. Runs 100% in the browser. Zero API cost.

### Where to code it
In `deaf.html`, add alongside the existing `SpeechRecognition` setup:
```javascript
const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 256;

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    detectEmotion(); // Start the emotion loop
});

function detectEmotion() {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Average volume (RMS-like)
    const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    // High frequencies = excitement/pitch
    const highFreq = dataArray.slice(dataArray.length * 0.7).reduce((a, b) => a + b, 0);

    let emotion = "calm";
    if (volume > 120) emotion = "urgent";
    else if (highFreq > 3000) emotion = "excited";

    applyEmotionOverlay(emotion); // Update the CSS class on the sign viewer
    requestAnimationFrame(detectEmotion);
}

function applyEmotionOverlay(emotion) {
    const viewer = document.getElementById("sign-viewer"); // or whatever the ID is
    viewer.dataset.emotion = emotion;
    // CSS handles the rest: [data-emotion="urgent"] { border: 3px solid red; animation: pulse 0.5s infinite; }
}
```

---

## 🔑 Feature 5 — Silent Handshake (No API Needed)

### What it does
The landing page (`index.html`) auto-detects whether the user is blind or deaf **without asking them**:
- Plays a soft audio tone AND shows a visual tap target simultaneously.
- **User taps the visual** → They can see → Route to Deaf Mode.
- **User presses Spacebar** → Screen reader / keyboard-first → Route to Blind Mode.

### Which API
**None** — pure JavaScript. Web Audio API for the tone.

### Where to code it
In `frontend/index.html`, inside your `<script>` tag:
```javascript
// Silent Handshake — detects user modality without asking
function silentHandshake() {
    const ctx = new AudioContext();

    // Play a gentle 440Hz tone for 1.5 seconds (users won't notice it consciously)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.05, ctx.currentTime); // Very quiet
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);

    // Listen for visual click → Deaf Mode
    document.getElementById("visual-target").addEventListener("click", () => {
        window.location.href = "/deaf.html";
    });

    // Listen for Spacebar → Blind Mode
    window.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            window.location.href = "/blind.html";
        }
    });
}

// Start handshake on first user interaction (required by browser audio policy)
document.addEventListener("click", silentHandshake, { once: true });
document.addEventListener("keydown", silentHandshake, { once: true });
```

Your landing page HTML needs a visual element with `id="visual-target"` — e.g. a glowing circle with the text "Tap to Enter."

---

## 📦 Final `.env.example` (complete, updated)

```
# ── Supabase ──────────────────────────────────────────────────────────────────
# Get from: https://supabase.com/dashboard → Settings → API
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here

# ── Groq (Sentence Simplification + Lesson Summarisation) ────────────────────
# Fastest open-source LLM inference. Free tier generous.
# Get from: https://console.groq.com/keys → Create API Key
GROQ_API_KEY=your_groq_api_key_here

# ── Together AI (Qwen3-VL — Board OCR / Vision) ───────────────────────────────
# Open-source SOTA vision model. $25 free credits on signup.
# Get from: https://www.together.ai/ → Settings → API Keys
TOGETHER_API_KEY=your_together_api_key_here

# ── Gemini (Fallback Vision OCR) ─────────────────────────────────────────────
# Used as fallback if Together AI is unavailable.
# Get from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# ── Vercel Deployment ──────────────────────────────────────────────────────────
VERCEL_URL=your_vercel_url_here
VERCEL_DASHBOARD_URL=your_vercel_dashboard_url_here
```

---

## 📋 `backend/requirements.txt` — add these packages

```
groq
together
```

---

## 🚦 What to build in order

| Step | Feature | Effort | Impact |
|---|---|---|---|
| 1 | Update `.env.example` + `.env` with Groq + Together keys | 5 min | Foundation |
| 2 | Add `/api/simplify` (Groq) to `main.py` | 20 min | Transforms ISL quality |
| 3 | Call simplify before ISL lookup in `deaf.html` | 15 min | Instant improvement |
| 4 | Add `/api/summarise` (Groq) to `main.py` | 20 min | Great demo closer |
| 5 | Replace Board OCR with Qwen3-VL in `main.py` | 30 min | Handles handwriting + Hindi |
| 6 | Add Emotion Overlay to `deaf.html` | 45 min | Visual wow factor |
| 7 | Build Silent Handshake on `index.html` | 1 hr | Pitch moment |

---

*Last updated: August 2026 | Indriya Team*
