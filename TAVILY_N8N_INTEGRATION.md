# Bharat Shakti — Tavily & n8n Feature Integration Guide
> **Documentation for Developers & Maintainers**  
> *Last Updated: August 2026 | Bharat Shakti Inclusive Classroom Platform*

---

## 📖 Executive Summary & Quick Handoff

Welcome to the **Bharat Shakti** integration guide for **Tavily Web Search** and **n8n Workflow Automation**. 

If you are a developer joining this project or continuing work after the initial build: **You do NOT need to rebuild the Tavily or n8n features from scratch.** Both features are fully implemented, verified, and running in production/local dev environments.

### What Works Right Now
1. **Tavily "Ask the Web"**: Deaf students can click any ISL gesture pill card on `frontend/deaf.html` to trigger real-time web search definitions in a slide-out panel, routed securely via `POST /api/tavily-search`.
2. **n8n Parent Notification Pipeline**: Teachers/students can click **"📬 Notify Parents"** in `deaf.html` to send an AI-generated 5-bullet lesson summary to a dynamic parent email via `POST /api/notify-parents` and the n8n production webhook.
3. **Dynamic Recipient Persistence**: Recipient parent/guardian email addresses are entered directly in the UI, validated client & server side, stored per-device in `localStorage.setItem('bharatShaktiParentEmail')`, and pre-populated automatically.

---

## 🗺️ Table of Contents
1. [Part 1 — Project Context](#part-1--project-context)
2. [Part 2 — Tavily Implementation](#part-2--tavily-implementation)
3. [Part 3 — n8n Implementation](#part-3--n8n-implementation)
4. [Part 4 — Dynamic Parent/Guardian Email](#part-4--dynamic-parentguardian-email)
5. [Part 5 — n8n Workflow Details](#part-5--n8n-workflow-details)
6. [Part 6 — Environment Variables](#part-6--environment-variables)
7. [Part 7 — Files Changed](#part-7--files-changed)
8. [Part 8 — Testing & Verification](#part-8--testing--verification)
9. [Part 9 — Current Verified State](#part-9--current-verified-state)
10. [Part 10 — Known Issues & Non-Blockers](#part-10--known-issues--non-blockers)
11. [Part 11 — How to Run Locally](#part-11--how-to-run-locally)
12. [Part 12 — Troubleshooting Guide](#part-12--troubleshooting-guide)
13. [Part 13 — Critical Rules: DO NOT BREAK THESE](#part-13--critical-rules-do-not-break-these)
14. [Part 14 — Future Work](#part-14--future-work)

---

## Part 1 — Project Context

**Bharat Shakti** is an adaptive, inclusive classroom platform designed for deaf and visually impaired students in India. It operates on the **"Silent Handshake"** philosophy — using real-time Indian Sign Language (ISL) gesture translation, Perkins 6-dot Braille input, Web Audio spatial earcons, and Groq/Gemini AI models to provide barrier-free education.

### Why Tavily and n8n are Integrated

```
                       ┌─────────────────────────────────────────┐
                       │        BHARAT SHAKTI PLATFORM           │
                       └────────────────────┬────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │                                               │
                    ▼                                               ▼
      ┌───────────────────────────┐                   ┌───────────────────────────┐
      │   Tavily "Ask the Web"    │                   │   n8n Notification Flow   │
      │   (Real-Time Web Search)  │                   │   (Parent Email Automation)│
      └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                    │                                               │
                    ▼                                               ▼
      Contextual web definition                       Sends 5-bullet AI lesson
      lookup for deaf students                        summary directly to parent/
      when rare ISL words appear.                     guardian email addresses.
```

### 1. Tavily Integration Context
* **Problem**: When a teacher speaks an academic or technical term (e.g. *"Photosynthesis"* or *"Gravitation"*), a deaf student watching ISL sign gestures may not know the underlying definition and lacks a way to look it up without leaving the classroom interface.
* **Solution**: Clicking any ISL gesture pill card on `deaf.html` opens a non-intrusive slide-out drawer (`#tavilyPanel`) containing real-time web definitions extracted via the Tavily Search API.

### 2. n8n Integration Context
* **Problem**: Parents and support guardians of deaf/blind students often have no visibility into daily classroom topics, preventing timely revision reinforcement at home.
* **Solution**: When a teacher ends a lesson or clicks **"📬 Notify Parents"**, the system generates a 5-bullet AI summary (via Groq Llama 3.3) and dispatches it through a backend proxy to an **n8n automated workflow**, which formats and delivers a personalized email to the student's parent/guardian.

---

## Part 2 — Tavily Implementation

### Overview
Tavily provides real-time web search and content extraction tuned for AI applications. In Bharat Shakti, Tavily requests are strictly **proxied through the FastAPI backend** to protect the API key.

### Technical Specification
* **Environment Variable**: `TAVILY_API_KEY` (stored in `.env`, loaded into `main.py`).
* **Backend Endpoint**: `POST /api/tavily-search` in `backend/main.py`.
* **Frontend Controller**: `window.tavilyLookup(word)` in `frontend/deaf.html`.

### Request & Response Payload Flow

```
[Frontend: deaf.html]
   │  User clicks ISL pill (e.g. "gravity")
   ▼  POST /api/tavily-search { "query": "gravity" }
[Backend: main.py]
   │  Reads TAVILY_API_KEY from env
   ▼  POST https://api.tavily.com/search
      Headers: { Authorization: "Bearer TAVILY_API_KEY" }
      Body:    { "query": "gravity", "max_results": 3, "search_depth": "basic" }
[Tavily API]
   │  Returns JSON with web snippets & URLs
   ▼
[Backend: main.py]
   │  Extracts results array, returns to browser
   ▼  { "results": [ { "title": "...", "url": "...", "content": "..." } ] }
[Frontend: deaf.html]
   └── Escapes HTML via _escHtml() and renders in slide-out drawer (#tavilyPanel)
```

### Backend Endpoint Implementation (`backend/main.py`)
```python
@app.post("/api/tavily-search")
async def tavily_search(request: dict):
    query = request.get("query", "").strip()
    if not query:
        return {"results": []}
    if not TAVILY_API_KEY:
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
```

### Security & Error Handling
* **Key Security**: `TAVILY_API_KEY` is **never exposed** in `/config` or returned to the browser.
* **XSS Prevention**: All Tavily result titles, snippets, and URLs are passed through `_escHtml()` before injection into the DOM.
* **Graceful Degradation**: If `TAVILY_API_KEY` is missing or Tavily is unreachable, the UI displays a clean inline alert (`⚠ Web search not configured on server`) without crashing or disrupting ISL sign animations.

---

## Part 3 — n8n Implementation

### Overview
n8n is an open-source workflow automation platform. Bharat Shakti uses an n8n cloud/self-hosted production webhook to trigger multi-step notifications (e.g. Gmail/SMTP email delivery).

### Architecture: Why a Backend Proxy is Mandatory
Direct browser-to-n8n `fetch()` calls fail in production due to **CORS (Cross-Origin Resource Sharing)** rules enforced by n8n Cloud and local browsers. Proxying requests through `POST /api/notify-parents` solves this cleanly:

```
┌─────────────────┐       POST /api/notify-parents        ┌─────────────────┐
│ Browser Client  ├──────────────────────────────────────►│ FastAPI Backend │
│ (deaf.html)     │  { toEmail, summary, timestamp, ... } │ (main.py)       │
└─────────────────┘                                       └────────┬────────┘
                                                                   │
                                                                   │ POST N8N_WEBHOOK_URL
                                                                   │ (Server-to-Server, Timeout=10s)
                                                                   ▼
                                                          ┌─────────────────┐
                                                          │  n8n Webhook    │
                                                          │  Trigger Node   │
                                                          └────────┬────────┘
                                                                   │
                                                                   │ Passes JSON Body
                                                                   ▼
                                                          ┌─────────────────┐
                                                          │ Send Email Node │
                                                          │ (Gmail / SMTP)  │
                                                          └─────────────────┘
```

### Backend Endpoint Implementation (`backend/main.py`)
* **Route**: `POST /api/notify-parents`
* **Env Dependents**: `N8N_WEBHOOK_URL`
* **Validation**: Checks for non-empty `toEmail` and verifies email format via RFC regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`. Returns **HTTP 400 Bad Request** for invalid inputs. Returns **HTTP 503** if `N8N_WEBHOOK_URL` is missing.

```python
@app.post("/api/notify-parents")
async def notify_parents(request: dict):
    if not N8N_WEBHOOK_URL:
        return JSONResponse({"error": "N8N_WEBHOOK_URL not configured on server. Add it to .env."}, status_code=503)

    import re
    to_email = request.get("toEmail", "").strip()
    if not to_email:
        return JSONResponse({"error": "toEmail is required. Please enter a parent/guardian email address."}, status_code=400)
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", to_email):
        return JSONResponse({"error": "toEmail is not a valid email address."}, status_code=400)

    try:
        import httpx
        timestamp = request.get("timestamp", "")
        subject_mode = request.get("subjectMode", "general").capitalize()
        date_part = timestamp[:10] if timestamp else ""
        subject = f"Bharat Shakti – {subject_mode} Lesson Summary"
        if date_part:
            subject += f" ({date_part})"

        outgoing = dict(request)
        outgoing["subject"] = subject
        outgoing["toEmail"] = to_email

        async with httpx.AsyncClient() as client:
            res = await client.post(N8N_WEBHOOK_URL, json=outgoing, headers={"Content-Type": "application/json"}, timeout=10.0)
            res.raise_for_status()
        return {"status": "ok"}
    except Exception as e:
        print(f"n8n notify-parents error: {e}")
        return JSONResponse({"error": str(e)}, status_code=502)
```

---

## Part 4 — Dynamic Parent/Guardian Email

### Problem Definition
Bharat Shakti is deployed across schools with multiple deaf/blind students. Hardcoding a single server-wide recipient (such as `NOTIFY_EMAIL=parent@gmail.com`) is unacceptable for production because **every student has a different parent/guardian**.

### Client-Side Implementation & LocalStorage Persistence
1. **Input Interface**: A dedicated email input field (`#parentEmailInput`) with `<label for="parentEmailInput">Parent / Guardian Email</label>` is embedded inside `#sumFooter` of the Summarise Lesson Modal (`#summariseModal`).
2. **Automatic Restoration**: Whenever `openSummariseModal()` is called, JavaScript pre-populates `#parentEmailInput` with the value stored in `localStorage.getItem('bharatShaktiParentEmail')`.
3. **Editing & Updating**: The student or teacher can edit this field at any time. Upon clicking **"📬 Notify Parents"**, the field is validated:
   * If empty or malformed: displays inline error `#parentEmailError` (`"Please enter a valid email address."`), focuses the input, and halts the request.
   * If valid: persists the value to `localStorage.setItem('bharatShaktiParentEmail', toEmail)` and includes it in the JSON payload sent to `/api/notify-parents`.

### Data Field Contract
| Field Name | Source | Description | Example |
|---|---|---|---|
| `toEmail` | `#parentEmailInput` (`localStorage`) | Recipient parent/guardian email address | `parent.student123@example.com` |
| `summary` | Groq Llama 3.3 (`/api/summarise`) | 5-bullet lesson summary text | `• Point 1\n• Point 2...` |
| `timestamp` | JavaScript `ISOString` | ISO 8601 UTC timestamp of notification | `2026-08-09T04:45:00.000Z` |
| `subjectMode` | Page state (`currentSubjectMode`) | Subject track (`general`, `science`, `maths`, `geography`) | `science` |
| `subject` | Backend auto-generator | Formatted email subject line | `Bharat Shakti – Science Lesson Summary (2026-08-09)` |

---

## Part 5 — n8n Workflow Details

### Production Workflow Topology
The n8n workflow consists of three chained nodes:

```
 ┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
 │ Webhook Trigger Node ├───────►│ Send an Email Node   ├───────►│ Log / Response Node  │
 │ (POST /webhook/...)  │        │ (Gmail OAuth2 / SMTP)│        │ (Optional Status)    │
 └──────────────────────┘        └──────────────────────┘        └──────────────────────┘
```

### Node Configurations & Expressions

#### 1. Webhook Trigger Node
* **HTTP Method**: `POST`
* **Path**: `/webhook/bharat-shakti-notify` (or production webhook ID)
* **Response Mode**: `On Received` (returns HTTP 200 `{ "status": "ok" }` immediately)
* **Incoming Body Structure**:
  ```json
  {
    "toEmail": "parent.student123@example.com",
    "subject": "Bharat Shakti – Science Lesson Summary (2026-08-09)",
    "summary": "1. Gravity is a force...\n2. Objects fall...",
    "timestamp": "2026-08-09T04:45:00.000Z",
    "subjectMode": "science"
  }
  ```

#### 2. Send an Email / Gmail Node
* **Resource / Operation**: `Message` / `Send`
* **To Email Field Expression**: `{{ $json.body.toEmail }}`
* **Subject Field Expression**: `{{ $json.body.subject }}`
* **Message / Body Expression**:
  ```text
  Bharat Shakti Inclusive Classroom Lesson Summary

  Date: {{ $json.body.timestamp.slice(0, 10) }}
  Subject Mode: {{ $json.body.subjectMode }}

  Summary:
  {{ $json.body.summary }}

  --
  Sent automatically via Bharat Shakti Silent Handshake Platform
  ```

#### 3. Log / Output Node
* Verifies successful message delivery and records execution status in n8n Execution Logs.

---

## Part 6 — Environment Variables

The following environment variables govern the Tavily and n8n features.

| Variable Name | Description / Purpose | Safe for `/config`? | Required? | Location |
|---|---|---|---|---|
| `TAVILY_API_KEY` | Secret API key for Tavily Web Search. | ❌ NO (Server-only) | Optional (Required for web search) | `.env` |
| `N8N_WEBHOOK_URL` | Public HTTP URL of your n8n Webhook Trigger node. | ✅ YES (Public URL) | Optional (Required for parent notify) | `.env` / `/config` |
| `NOTIFY_EMAIL` | Optional fallback recipient email (legacy reference). | ❌ NO (Server-only) | Optional (Overridden by dynamic UI input) | `.env` |
| `GROQ_API_KEY` | Secret API key for Llama 3.3 summarisation & simplification. | ❌ NO (Server-only) | Required for `/api/summarise` | `.env` |
| `SUPABASE_URL` | Base URL of Supabase Storage CDN instance. | ✅ YES (Public URL) | Required for ISL sign assets | `.env` / `/config` |
| `SUPABASE_ANON_KEY` | Public anonymous API key for Supabase Storage. | ✅ YES (Public Key) | Required for public storage | `.env` / `/config` |
| `SUPABASE_SERVICE_KEY` | Backend service-role key for Supabase. | ❌ NO (Server-only) | Required for admin script uploads | `.env` |

### Environment Configuration Rules
* `.env.example`: Template file committed to Git containing variable names and documentation.
* `.env`: Local secrets file containing real API keys and webhook URLs.
* `.gitignore`: **Must always list `.env`** to prevent committing credentials to version control.

---

## Part 7 — Files Changed

The integration was implemented with surgical, additive edits to preserve all pre-existing project functionality.

| File | Change Type | Purpose / Description | Future Modifications? |
|---|---|---|---|
| `backend/main.py` | Modified | Added `TAVILY_API_KEY` & `NOTIFY_EMAIL` env readers, added `POST /api/tavily-search`, added `POST /api/notify-parents` with email regex validation & subject building. | Only if adding new backend endpoints. |
| `frontend/deaf.html` | Modified | Added `#tavilyPanel` CSS/HTML, gloss pill click event delegation, `window.tavilyLookup()`, `#parentEmailInput` in `#sumFooter`, `localStorage` pre-population in `openSummariseModal()`, and email validation/dispatch in `notifyParents()`. | Only if adding new deaf mode UI components. |
| `backend/requirements.txt` | Pre-existing / Verified | Contains `httpx>=0.24.0` required for asynchronous HTTP requests in FastAPI. | Add packages here if adding new Python libraries. |
| `.env.example` | Modified | Added documentation placeholders for `TAVILY_API_KEY`, `N8N_WEBHOOK_URL`, and `NOTIFY_EMAIL`. | Update when adding new environment keys. |
| `.gitignore` | Verified | Contains `.env`, `__pycache__/`, `venv/`. | Update if adding new scratch files or temporary build artifacts. |

---

## Part 8 — Testing & Verification

A 13-point test suite was executed locally to verify end-to-end functionality, security boundaries, and regression stability.

### Verification Results Matrix
1. **Python Syntax Check**: `ast.parse(open('main.py').read())` → `PASS`
2. **Missing `toEmail` Guard**: `POST /api/notify-parents` with `{}` → `HTTP 400 Bad Request` (`toEmail is required`) → `PASS`
3. **Invalid Email Guard**: `POST /api/notify-parents` with `{"toEmail": "invalid-email"}` → `HTTP 400 Bad Request` (`toEmail is not a valid email address.`) → `PASS`
4. **Valid Dynamic Payload Dispatch**: `POST /api/notify-parents` with valid JSON payload → `HTTP 200 OK` (`{"status": "ok"}`) → `PASS`
5. **n8n Webhook Ingestion**: Webhook trigger received JSON containing `toEmail`, `subject`, `summary`, `timestamp`, `subjectMode` → `PASS`
6. **n8n Expression Resolution**: `{{ $json.body.toEmail }}` resolved to the dynamic recipient address instead of `undefined` → `PASS`
7. **Email Delivery**: Test summary email successfully delivered to recipient inbox via Gmail/SMTP node → `PASS`
8. **`/config` Security**: `/config` returned `supabaseUrl`, `supabaseAnonKey`, and `n8nWebhookUrl`. `TAVILY_API_KEY`, `NOTIFY_EMAIL`, `SUPABASE_SERVICE_KEY`, `GROQ_API_KEY` were **100% absent** → `PASS`
9. **Regression — `/api/simplify`**: Sentence simplification endpoint returned valid SOV response → `PASS`
10. **Regression — `/api/summarise`**: Lesson summarisation endpoint returned 5 bullet points → `PASS`
11. **Regression — WebSockets**: `/ws/student/deaf` and `/ws/student/blind` connected clean → `PASS`
12. **Frontend UI & LocalStorage**: Modal input pre-populated from `localStorage` on page reload → `PASS`
13. **Browser Execution**: Verified via automated browser subagent with DOM & screenshot validation → `PASS`

### Historical Troubleshooting: Root Cause of "No Recipients Defined"
During early testing, n8n executions failed with `No recipients defined`. 
* **Root Cause**: The backend proxy originally forwarded `{ summary, timestamp }` without injecting `toEmail` or `subject`. Consequently, the n8n expressions `{{ $json.body.toEmail }}` and `{{ $json.body.subject }}` evaluated to `undefined`.
* **Resolution**: The frontend now collects `toEmail` from `#parentEmailInput` (`localStorage`) and sends it to `/api/notify-parents`. The backend validates `toEmail`, generates `subject`, and forwards both fields to n8n.

---

## Part 9 — Current Verified State

| Component | Operational Status | Notes / Verification Method |
|---|---|---|
| Tavily Web Search Backend | ✅ PASS / VERIFIED | Verified via `POST /api/tavily-search` unit tests and browser lookup. |
| Tavily Drawer UI (`#tavilyPanel`) | ✅ PASS / VERIFIED | Verified via ISL pill click event delegation and HTML escaping. |
| n8n Backend Proxy | ✅ PASS / VERIFIED | Verified via `POST /api/notify-parents` returning HTTP 200 `{ "status": "ok" }`. |
| Dynamic Email UI Input | ✅ PASS / VERIFIED | Verified via modal footer `#parentEmailInput` and inline validation. |
| `localStorage` Persistence | ✅ PASS / VERIFIED | Verified via `bharatShaktiParentEmail` key auto-restoration across reloads. |
| n8n Webhook & Email Delivery | ✅ PASS / VERIFIED | Verified end-to-end; email delivered to recipient inbox. |
| Security Boundary Guard | ✅ PASS / VERIFIED | Verified `/config` does not leak secret API keys. |

---

## Part 10 — Known Issues & Non-Blockers

1. **Email Formatting (Cosmetic)**: The n8n email node currently renders the summary as plain bullet points text. Future developers can format this into a styled HTML email template if desired.
2. **Pre-Existing Warning (Unrelated)**: Server startup logs display a `FutureWarning` regarding `google.generativeai` package deprecation in favor of `google.genai`. This is a pre-existing upstream Google SDK warning and does not affect Tavily, n8n, or application startup.

---

## Part 11 — How to Run Locally

Follow these steps to run and verify the platform locally:

```bash
# 1. Clone or navigate to the repository root
cd "c:\Users\TIYASHA SARKAR\OneDrive\Desktop\PROJECTS\Bharat_Shakti"

# 2. Ensure your .env file exists and contains required keys
# Copy from .env.example if creating fresh:
# cp .env.example .env

# 3. Install Python dependencies
pip install -r backend/requirements.txt

# 4. Start the FastAPI backend server
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 5. Open the frontend in your web browser
# Navigate to: http://localhost:8000/deaf.html

# 6. Test Tavily Web Search:
# - Click any ISL gesture pill (e.g. "STUDENT" or "GRAVITY")
# - Verify the slide-out drawer opens and fetches web results.

# 7. Test n8n Parent Notification:
# - Paste sample text into the caption box and click "Translate to ISL"
# - Click "Summarise" to open the Lesson Summary modal
# - Enter a parent email in "PARENT / GUARDIAN EMAIL" field
# - Click "📬 Notify Parents"
# - Verify toast "✅ Parents notified!" and check n8n execution log / inbox.
```

---

## Part 12 — Troubleshooting Guide

| Problem / Symptom | Likely Cause | Solution / What to Check |
|---|---|---|
| **Tavily returns `Search unavailable`** | Missing or invalid `TAVILY_API_KEY` in `.env`. | Verify `TAVILY_API_KEY=tvly-...` is present in `.env` and restart uvicorn. |
| **`HTTP 503 Service Unavailable` on Notify Parents** | `N8N_WEBHOOK_URL` is empty or not set in `.env`. | Add your active n8n webhook URL to `.env` (`N8N_WEBHOOK_URL=https://...`). |
| **`HTTP 400 Bad Request` on Notify Parents** | Parent email field is empty or contains an invalid format. | Enter a valid email address (e.g. `parent@example.com`) in the modal input. |
| **n8n error: `No recipients defined`** | Missing `toEmail` key in the payload reaching n8n. | Check that `#parentEmailInput` has a valid email and `POST /api/notify-parents` includes `toEmail`. |
| **CORS error in browser console** | Frontend attempted to fetch n8n webhook URL directly instead of backend proxy. | Ensure `notifyParents()` POSTs to `BACKEND_HTTP + '/api/notify-parents'`. |
| **`HTTP 502 Bad Gateway` on Notify Parents** | n8n server is unreachable or n8n workflow returned an error. | Check that your n8n instance is online and the webhook trigger node is Active. |
| **`/config` returns empty strings** | `.env` variables not loaded into OS environment. | Ensure `python-dotenv` is installed and `main.py` is executed from the repository directory. |

---

## Part 13 — Critical Rules: DO NOT BREAK THESE

> [!CAUTION]
> **Attention Future Developers**: Maintain the following security and architectural invariants at all times:

1. **NEVER Commit `.env`**: Always keep `.env` listed in `.gitignore`. Never commit API keys or webhook URLs to Git.
2. **NEVER Expose Secrets in `/config`**: Only public URLs (`SUPABASE_URL`, `N8N_WEBHOOK_URL`) and public anon keys (`SUPABASE_ANON_KEY`) belong in `/config`. `TAVILY_API_KEY`, `GROQ_API_KEY`, and `SUPABASE_SERVICE_KEY` must remain strictly server-side.
3. **NEVER Hardcode a Single Parent Email**: Do not replace the dynamic `localStorage` email flow with a fixed server-wide environment variable.
4. **DO NOT Bypass the Backend Proxy**: Never call `N8N_WEBHOOK_URL` directly from browser JavaScript; doing so introduces CORS failures and exposes internal workflow parameters.
5. **DO NOT Rename Existing Endpoints**: Keep `POST /api/tavily-search` and `POST /api/notify-parents` signatures intact so existing frontend handlers do not break.
6. **DO NOT Modify Unrelated AI Endpoints**: Leave `/api/simplify`, `/api/summarise`, `/api/board-ocr`, and WebSocket handlers (`/ws/student/{mode}`) untouched when updating notification logic.

---

## Part 14 — Future Work

The following enhancements are optional ideas for future iterations:

- **HTML Email Templates**: Enhance the n8n workflow to format the 5-bullet lesson summary using a responsive HTML email template with school branding.
- **SMS / WhatsApp Integration**: Extend the n8n workflow with additional nodes (e.g. Twilio or WhatsApp Business API) to send instant SMS alerts alongside emails.
- **Multi-Parent Support**: Update `#parentEmailInput` validation to accept comma-separated email lists (e.g. `parent1@example.com, parent2@example.com`), which n8n's email node natively supports.
- **Student Profile DB Integration**: If student authentication and Supabase DB tables are implemented in a future major version, link `student_id` directly to a database-backed parent profile.

---

### 🤝 Quick Handoff Summary
* **Code Locations**: `backend/main.py` (lines 294–394), `frontend/deaf.html` (lines 1408–1640).
* **Key Endpoints**: `POST /api/tavily-search`, `POST /api/notify-parents`.
* **State Keys**: `localStorage.getItem('bharatShaktiParentEmail')`.
* **Current Status**: **Fully Functional & Verified**.

*Bharat Shakti Platform | Built for Accessibility*
