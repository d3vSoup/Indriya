# Project Indriya — Complete Project Context & Architecture Report

> **Mission Statement:** *"Inclusivity is not a setting you toggle — it is an adaptive environment."*  
> Indriya is an inclusive education web platform that dynamically auto-detects sensory impairments (deafness or blindness) and adapts its interface in real-time to deliver accessible classroom content.

---

## 🌐 1. Live Cloud Infrastructure & Deployment

The platform is deployed globally with a decoupled, high-performance architecture:

| Tier | Host | Live URL | Function |
|---|---|---|---|
| **Frontend** | **Vercel** | `https://indriya.vercel.app` | Static HTML5/JS Web App (`index.html`, `deaf.html`, `blind.html`) |
| **Backend API** | **Render** | `https://bharat-shakti-backend.onrender.com` | Python FastAPI server handling WebSockets & Google Translate API |
| **Asset CDN** | **Supabase** | `https://cnwsrgqlpvxxnwsndhsm.supabase.co` | 269 cloud-hosted ISL gesture images & animated GIFs |

---

## 🤟 2. Deaf Mode (Text-to-ISL Engine) — Completed Capabilities

The Deaf Mode module (`deaf.html`, `isl-engine.js`, `isl-dict.js`) translates spoken or typed teacher speech into real-time Indian Sign Language (ISL) animations.

### A. Real-Time Speech & Language Detection
- **Web Speech API Integration**: Native browser speech recognition capturing teacher voice with 0 server latency.
- **3-Tier Language Auto-Detection**:
  1. **Devanagari Regex**: Instant zero-latency detection for Hindi characters (`[\u0900-\u097F]`).
  2. **Backend Google Translate API**: `/detect-lang` endpoint leveraging official Google Translate API.
  3. **Hinglish Dictionary Fallback**: Detects romanized Hindi words (e.g. `namaste`, `shikshak`, `dhanyawad`).

### B. ISL Gloss NLP Pipeline (Grammar Transformation)
- Converts English **Subject-Verb-Object (SVO)** sentence structure into **ISL Subject-Object-Verb (SOV)** grammar.
- **Stopword Removal**: Removes articles, auxiliary verbs, and filler words (`is`, `am`, `are`, `the`, `a`) for clean signing.
- **Fingerspelling Fallback**: Unrecognized words gracefully fall back to letter-by-letter fingerspelling.

### C. Complete Cloud Asset Ecosystem (269 Assets on Supabase CDN)
- **26 English Letter Photos**: High-contrast 384×384 real hand photos for A–Z.
- **86 Animated ISL GIFs**: Real animated gesture GIFs (`satyam9090` dataset).
- **77 Vivit Landmark Stills**: Landmark-overlaid ISL word frames (`kaushikyh` Kaggle dataset).
- **40 Hindi Devanagari Sign Photos**: Real hand photos for Devanagari letters (`HindiSignImages48x48` dataset).
- **ASCII Storage Transliteration**: Devanagari Unicode keys transliterated to safe storage paths (`अ → hi_a.jpg`, `क्ष → hi_ksha.jpg`) to bypass S3/Supabase key restrictions.

### D. UX & Reliability Features
- **Anti-Glitch Debouncing**: Real-time speech updating is debounced so gesture playback remains smooth and jitter-free during live speech.
- **1-Hour Dialogue Log**: Automatically persists classroom dialogue in `localStorage` for 60 minutes with auto-pruning.
- **Print-Ready PDF Export**: Export full 1-hour dialogue history to clean A4 PDFs with customizable sign speed controls.
- **Material Symbol Iconography**: Standardized SVGs replacing generic emojis across all status indicators, mode toggles, and buttons.

---

## 🦯 3. Blind Mode & Silent Handshake (Core Foundation)

- **Sensory Onboarding Test ("Silent Handshake")**: On initial load (`index.html`), presents combined audio/visual cues to route students automatically to `blind.html` or `deaf.html`.
- **Perkins 6-Dot Braille Virtual Keyboard**: QWERTY keys remapped (`F`, `D`, `S` for dots 1, 2, 3; `J`, `K`, `L` for dots 4, 5, 6).
- **Speech Synthesis Audio Feedback**: Web Speech API (`SpeechSynthesis`) narrates typed letters and screen controls aloud.

---

## 🛠️ 4. Asset Migration & Management Tools

- **`upload_to_supabase.py`**: Automated Python script leveraging `supabase-py` SDK to upload and sync local ISL gesture libraries with Supabase Storage buckets (`isl-gestures`).
- **`frontend/hindi_sign_urls.json`**: Auto-generated mapping table linking Devanagari characters to public Supabase CDN URLs.

---

## 📁 5. Repository Structure

```
Bharat_Shakti/
├── backend/
│   ├── main.py              # FastAPI server (WebSockets, /detect-lang, CORS)
│   └── requirements.txt     # Python dependencies (fastapi, uvicorn, python-dotenv)
├── frontend/
│   ├── index.html           # Landing page & Silent Handshake onboarding
│   ├── deaf.html            # Deaf Mode UI (Speech-to-ISL, PDF Export, Logs)
│   ├── blind.html           # Blind Mode UI (Virtual Braille, TTS Audio)
│   ├── isl-engine.js        # ISL playback queue, timing, & canvas renderer
│   ├── isl-dict.js          # Gesture dictionary & SVO->SOV NLP parser
│   ├── hindi_sign_urls.json # CDN URL mapping for Devanagari signs
│   └── styles.css           # Global Tailwind & custom design system tokens
├── upload_to_supabase.py    # Supabase cloud asset sync script
├── context.md               # Complete project documentation & progress log
└── bharat_shakti_master_document.md # Original hackathon blueprint
```

---

## 🎯 6. Next Roadmap Milestones

1. **Blind Mode Polish**: Enhance 6-dot Perkins Braille audio feedback and screen reader accessibility.
2. **MediaPipe Two-Way Sign Language Recognition**: Integrate `@mediapipe/hands` in browser to allow deaf students to sign back to teachers via webcam.
3. **Multi-Tenant Classroom Sync**: Sync teacher speech simultaneously across both `deaf.html` and `blind.html` using FastAPI WebSockets.
