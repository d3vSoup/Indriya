# Indriya — PPT Answer Sheet

---

## ❓ What Problem Does This Aim to Solve?

India has **over 18 million deaf people** and millions more with visual impairments — yet most of them sit in the same classrooms as everyone else, understanding nothing.
A teacher speaks. A deaf child watches lips move. A blind child stares at a board they cannot see.
**The classroom hasn't changed for them in decades.**

Indriya solves one thing: **the silence between a teacher's voice and a student who cannot hear or see it.**

---

## ❓ Why Did Your Team Choose This?

Because it's a problem hiding in plain sight.

We didn't need a survey. We needed to walk into any government school. Deaf and blind students are *present* in classrooms but not *participating* in them. No interpreter. No Braille device. No support — just the expectation that they manage.

We chose this because **a child's right to education should not depend on which senses they were born with.**

---

## ❓ Who Faces This Issue?

- **18M+ deaf students** across India who use Indian Sign Language (ISL) but whose teachers don't
- **Millions of visually impaired students** who cannot afford a Braille device (costs ₹45,000+)
- Primarily affects **government school students in Tier 2/3 cities and rural India** — the ones already underserved
- Also affects **teachers** who want to be inclusive but have no tools to do so

---

## ❓ What's the Current Gap?

| What Exists | What's Missing |
|---|---|
| Sign language interpreters | Too expensive, too rare |
| Hardware Braille devices | ₹45,000 per unit — unaffordable at scale |
| Special schools for the disabled | Segregates students from mainstream classrooms |
| Generic accessibility settings in OS | No real-time classroom translation |

**The gap:** No solution works *inside a regular classroom, in real-time, at zero hardware cost.*

---

## ❓ How Does Indriya Fill That Gap?

Indriya runs **entirely in a browser**. No app download. No special device. No driver.

- Teacher speaks → student's screen shows **live Indian Sign Language animations**
- Blind student types on any QWERTY keyboard in **Braille** → gets instant **audio feedback**
- System **silently detects** the student's needs and configures itself — no pop-ups, no questions
- At the end of class, **AI generates a revision summary** the student keeps forever

From a ₹5,000 school laptop to a ₹500 Android phone — it works.

---

## ❓ Connection to Government Schemes

| Scheme | Connection |
|---|---|
| **Accessible India Campaign (Sugamya Bharat)** | Directly aligned — digital accessibility for the disabled |
| **PM eVIDYA / DIKSHA** | Extends digital classroom initiative to disabled students |
| **National Education Policy 2020** | NEP mandates inclusive education — Indriya implements it |
| **Digital India** | Browser-first, zero-hardware approach — no infrastructure gap |
| **ADIP Scheme** (Assistive Devices for Disabled Persons) | Could replace expensive Braille devices at scale |

---

## ❓ What Are You Building? *(100–150 words)*

**Indriya** is an AI-powered inclusive classroom platform that gives deaf and blind students real-time access to their teacher — in any school, on any device, for free.

When a teacher speaks, Indriya captures their voice, converts it into Indian Sign Language animations using NLP and a 269-sign cloud dictionary, and displays it live on the deaf student's screen — reordered into proper ISL grammar (SOV).

For blind students, any standard QWERTY keyboard becomes a 6-dot Perkins Braille input device with audio feedback for every keystroke. The system silently detects accessibility needs on first load and configures itself automatically — no configuration needed.

At the end of class, an AI (Groq Llama 3.3) summarises the full lecture into 5 revision bullets. No app. No hardware. Just a URL.

---

## ❓ 3–4 Key Features

### 🤟 1. Real-Time Text-to-ISL Translation
Teacher's live speech → NLP pipeline strips filler words, reorders English SVO to ISL SOV grammar → 269 animated ISL gesture images play in sequence on student's screen. Supports Hindi and English. Fingerspelling fallback for unknown words.

### 🦯 2. Virtual Braille Keyboard
S, D, F (dots 1–2–3) + J, K, L (dots 4–5–6) on any keyboard = a Perkins Braille machine. Audio confirms each dot. Commits characters, words, sentences. Exports to PDF. Costs ₹0 in hardware.

### 🤫 3. Silent Handshake (Zero-Config Onboarding)
On first load, the system detects OS accessibility flags (forced contrast, reduced motion). Spacebar → Blind Mode. Click → Deaf Mode. A blind user never needs to navigate a menu. **The interface adapts to the person — not the other way around.**

### 🧠 4. AI Lesson Intelligence
- **Groq Llama 3.3** simplifies complex academic sentences into ISL-friendly vocabulary in <100ms
- **Qwen3-VL 72B** reads handwritten Hindi/English off a physical whiteboard via webcam
- **5-bullet revision summary** auto-generated at end of class — TTS-read aloud for blind students

---

## ❓ What Makes It Different / Innovative?

| Everyone Else | Indriya |
|---|---|
| Separate apps for deaf / blind | One URL handles both — auto-detects |
| Pre-recorded sign language videos | Live, real-time, sentence-aware ISL |
| Hardware devices (₹45,000 Braille) | Any keyboard on any device |
| ISL as a visual-only tool | Emotion overlay: vocal tone → ISL stage colour |
| Manual teacher input | Board OCR: camera reads whiteboard automatically |
| Static accessibility tools | AI simplifies the teacher's language *for* the student |

**The real innovation:** Indriya is not an accessibility *tool* bolted onto education. It is education — redesigned from the student's perspective, delivered through the teacher's voice.

---

## ❓ Tech Stack

### Frontend
- Vanilla HTML5 / CSS / JavaScript *(zero framework — runs on any browser, any device)*
- Tailwind CSS + custom design system tokens
- Web Speech API (live speech recognition)
- Web Audio API (emotion detection + TTS feedback)
- Canvas API (ISL gesture rendering)
- `navigator.vibrate()` (Braille haptic feedback on mobile)

### Backend
- **FastAPI** (Python) — REST endpoints + WebSocket broadcast server
- **WebSockets** — sub-50ms live broadcast from teacher → all students simultaneously
- **Groq API** — Llama 3.3 70B for sentence simplification + lesson summarisation
- **Together AI** — Qwen3-VL 72B for whiteboard OCR (Hindi + English handwriting)
- **Google Translate API** — 3-tier language detection (Hindi / English / Hinglish)

### APIs & Libraries
| Tool | Purpose |
|---|---|
| Groq (Llama 3.3) | AI sentence simplification + lesson summary |
| Together AI (Qwen3-VL) | Whiteboard / board OCR vision |
| Google Translate API | Language auto-detection |
| spaCy NLP logic | SVO → SOV grammar reordering |
| jsPDF | Exam + dialogue PDF export |
| GSAP | Accordion gallery animations |

### Database / Storage
- **Supabase Storage** — CDN for 269 ISL gesture images + animated GIFs
- `localStorage` — 1-hour classroom session persistence (no server round-trip)

---

## ❓ Deployment Plan

```
[ Teacher's Laptop / Phone ]
       ↓ speaks
  Web Speech API (browser)
       ↓ text
  FastAPI Backend (Render)
  ├── /api/simplify  → Groq LLM
  ├── /api/board-ocr → Qwen3-VL
  ├── /detect-lang   → Google Translate
  └── WebSocket → broadcasts to all students
       ↓
[ Student Screens (any browser, any device) ]
  deaf.html  → ISL signs (Supabase CDN images)
  blind.html → Braille keyboard + TTS audio
```

| Layer | Platform | URL |
|---|---|---|
| **Frontend** | Vercel (auto-deploy from GitHub) | `bharat-shakti-one.vercel.app` |
| **Backend API** | Render (FastAPI + WebSocket) | `bharat-shakti-backend.onrender.com` |
| **Asset CDN** | Supabase Storage | 269 ISL gesture images |
| **AI** | Groq Cloud + Together AI | Sub-100ms inference |

**Zero infrastructure cost for schools.** Runs on government-issued laptops, Android phones, tablets. No installation. No sign-up. Open the URL — it works.

---

> *"An interface feels alive when it adapts to the person using it — not the other way around."*
> **Indriya. Every classroom. Every student. No exceptions.**
