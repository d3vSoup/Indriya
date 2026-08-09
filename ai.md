# Indriya — AI/ML Integration Strategy

> Where does AI fit in this project? What models, what APIs, what's realistic, what's a moonshot? This document maps every AI opportunity across Deaf Mode, Blind Mode, and the platform as a whole.

---

## 🧠 The Core Principle

**AI should be invisible infrastructure, not a feature checkbox.**

Judges don't care that you "used AI." They care that a deaf student understood a lecture, or a blind student took an exam. AI is the engine — not the product. Every AI integration below is framed by the **human problem it solves**, not the model it uses.

---

## 🗺️ AI Integration Map — Where AI Fits

```
┌─────────────────────────────────────────────────────────────────┐
│                    INDRIYA AI MAP                         │
├──────────────────────┬──────────────────────┬───────────────────┤
│     DEAF MODE        │     BLIND MODE       │    PLATFORM       │
├──────────────────────┼──────────────────────┼───────────────────┤
│ 1. ISL Sign Recog.   │ 5. Board OCR         │ 9. Smart Summary  │
│    (MediaPipe+XGB)   │    (Vision API/OCR)  │    (Gemini API)   │
│                      │                      │                   │
│ 2. Sentence Simplify │ 6. PDF Text Extract  │ 10. Auto-Detect   │
│    (Gemini/GPT)      │    (OCR + NLP)       │     Impairment    │
│                      │                      │     (Heuristic)   │
│ 3. Emotion Detect    │ 7. Voice-to-Braille  │                   │
│    (Prosody Model)   │    (Whisper + Map)   │ 11. Language ID   │
│                      │                      │     (Google API)  │
│ 4. Context Disambig. │ 8. Braille Haptics   │                   │
│    (NLP/Embeddings)  │    (Vibration API)   │ 12. Content Adapt │
│                      │                      │     (LLM Rewrite) │
└──────────────────────┴──────────────────────┴───────────────────┘
```

---

## 🔬 Detailed AI Integrations

---

### 1. 🤟 ISL Sign Recognition — Student Signs Back (MediaPipe + XGBoost)

**Problem:** Communication is one-way. The deaf student can't respond to the teacher in ISL.

**Solution:**
- **Google MediaPipe Hands** runs in-browser (TensorFlow.js) — extracts 21 hand landmarks (x, y, z) per hand at 30fps from the webcam. Zero server needed.
- **XGBoost / Random Forest classifier** trained on the landmark coordinates to classify which ISL sign the student is performing.
- The classified sign maps to a word → displayed as text on the teacher's dashboard.

**Why XGBoost specifically?**
- MediaPipe gives you 42 landmark points (21 per hand × 2 hands) × 3 coordinates = **126 features per frame**.
- This is a classic **tabular classification problem** — XGBoost dominates tabular data. It's lightweight enough to run in-browser via ONNX Runtime Web.
- No need for a deep learning model for static hand pose classification. XGBoost trains in minutes, infers in microseconds.

**Training pipeline:**
```
1. Record ISL signs via webcam (100+ samples per sign)
2. Extract MediaPipe landmarks → CSV (126 features per frame)
3. Train XGBoost classifier (sklearn/xgboost)
4. Export to ONNX → load in browser via onnxruntime-web
5. Real-time inference: webcam → MediaPipe → landmarks → ONNX → predicted sign
```

**Datasets:**
- Our own `HindiSignImages48x48` dataset (40 Devanagari letters)
- [INCLUDE dataset (AI4Bharat)](https://github.com/AI4Bharat/INCLUDE) — large-scale ISL video dataset
- [ISL-CSLTR](https://zenodo.org/records/4010759) — continuous ISL sentences

**Model:** `XGBoost` → exported to `ONNX` → runs in browser via `onnxruntime-web`
**Fallback:** If too slow, use a simple `k-NN` classifier on landmarks (even faster).

---

### 2. 🧠 AI Sentence Simplification (Gemini API / GPT-4o-mini)

**Problem:** Academic sentences have zero ISL dictionary coverage. "Photosynthesis is the biochemical process by which chloroplasts convert solar radiation into glucose" = 100% fingerspelling = unintelligible.

**Solution:** Before ISL lookup, send the sentence to an LLM with a system prompt:

```
System: You are an ISL (Indian Sign Language) simplifier.
Rewrite the following sentence using simple, common words that are likely
to have ISL gesture equivalents. Keep the core meaning. Use SOV word order.
Remove articles, auxiliary verbs, and filler words.
Output ONLY the simplified sentence, nothing else.

Input: "Photosynthesis is the biochemical process by which chloroplasts
convert solar radiation into glucose."

Output: "PLANT SUNLIGHT FOOD MAKE"
```

**Model Options:**

| Model | Latency | Cost | Quality | Recommendation |
|---|---|---|---|---|
| **Gemini 2.0 Flash** | ~200ms | Free tier available | Good | ✅ Best for hackathon |
| **GPT-4o-mini** | ~300ms | $0.15/1M tokens | Great | Good backup |
| **Gemini Nano (on-device)** | ~50ms | Free, offline | Decent | Best for production |
| **Grok API (xAI)** | ~400ms | Pay-per-use | Good | Viable alternative |
| **Local Llama 3.1 8B** | ~500ms | Free, self-hosted | Good | Best for privacy |

**Recommendation:** Start with **Gemini 2.0 Flash** (free tier, fast, Google ecosystem matches MediaPipe). Fall back to GPT-4o-mini if needed.

---

### 3. 🎭 Emotion & Tone Detection from Speech (Prosody Analysis)

**Problem:** Deaf students miss 100% of vocal emotion — sarcasm, urgency, excitement, gentleness. Text alone strips this away.

**Solution:** Analyse the teacher's audio stream for prosodic features:

**Approach A — Lightweight (browser-side):**
- Use the **Web Audio API** to extract real-time features:
  - **Pitch (F0)**: High pitch = excitement/question. Low pitch = calm/statement.
  - **Volume (RMS energy)**: Loud = emphasis/urgency. Quiet = calm.
  - **Speech rate**: Fast = excitement. Slow = emphasis.
- Simple **rule-based classifier**: if pitch > threshold AND volume > threshold → "URGENT". No ML needed for 80% accuracy.

**Approach B — ML-powered (server-side):**
- **Model:** `facebook/wav2vec2-large-robust-ft-ser` (Speech Emotion Recognition, fine-tuned on IEMOCAP dataset).
- Send 3-second audio chunks to the backend → classify as one of: neutral, happy, sad, angry, fearful.
- Display as a colour overlay on the ISL viewer.

**Recommendation:** Start with **Approach A** (zero-latency, no API cost, works offline). Upgrade to Approach B post-hackathon.

---

### 4. 🗣️ Contextual Sign Disambiguation (Word Embeddings / NLP)

**Problem:** "Bank" has 2 ISL signs (river vs. money). "Light" has 2 signs (weight vs. lamp). Naive word-lookup picks the wrong one.

**Solution:**
- Use **word embeddings** (Word2Vec / GloVe / sentence-transformers) to compute the **semantic context** of the surrounding sentence.
- Compare the context vector against labelled sign variants.
- Pick the sign whose training context is most similar.

**Example:**
```
Sentence: "The river flows past the bank."
Context words: [river, flows, past] → semantic cluster: GEOGRAPHY
→ Pick ISL sign: bank_river (not bank_money)

Sentence: "I withdrew cash from the bank."
Context words: [withdrew, cash] → semantic cluster: FINANCE
→ Pick ISL sign: bank_money
```

**Model:** `all-MiniLM-L6-v2` (sentence-transformers, 22MB, runs in Python backend in ~5ms per sentence).

**Simpler Alternative:** Skip embeddings — use a **keyword window heuristic**. If "river", "water", "flow" appear near "bank" → geography sign. If "money", "cash", "ATM" appear → finance sign. This covers 80% of cases with zero ML.

---

### 5. 📸 Live Classroom Board Reading (OCR → Audio + Braille)

**This is the big one the user specifically asked about.**

**Problem:** The teacher writes on the whiteboard. The blind student hears nothing. The deaf student sees the ISL translation of speech but not the board content.

**Solution — The Board Reader Pipeline:**

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  CAMERA      │ →  │  FRAME       │ →  │  OCR         │ →  │  BROADCAST   │
│  (Phone/     │    │  EXTRACTION  │    │  ENGINE      │    │  TO STUDENTS │
│   Webcam)    │    │  (every 2s)  │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                              │
                                    ┌─────────┴─────────┐
                                    ▼                   ▼
                              BLIND STUDENT        DEAF STUDENT
                              ┌─────────────┐    ┌─────────────┐
                              │ TTS Read     │    │ ISL Signs   │
                              │ Aloud        │    │ Rendered    │
                              │ + Braille    │    │             │
                              │ Document     │    │             │
                              └─────────────┘    └─────────────┘
```

**How it works:**
1. A **phone camera** or **USB webcam** is pointed at the whiteboard/blackboard.
2. The frontend captures a frame every 2–3 seconds using `<video>` + `canvas.toBlob()`.
3. Frame is sent to the backend for OCR processing.
4. OCR extracts text from the board image.
5. New text (compared to previous frame's text via diff) is broadcast to all students:
   - **Blind student**: receives text → TTS reads aloud + text appended to a Braille document.
   - **Deaf student**: receives text → ISL engine translates and renders signs.

**OCR Model Options:**

| Model | Where it runs | Quality | Cost | Handwriting? |
|---|---|---|---|---|
| **Google Cloud Vision API** | Cloud | Excellent | $1.50/1000 images | ✅ Yes |
| **Tesseract.js** | In-browser (WASM) | Good (typed text) | Free | ❌ No |
| **PaddleOCR** | Backend (Python) | Great | Free, open-source | ✅ Partial |
| **EasyOCR** | Backend (Python) | Good | Free, open-source | ✅ Partial |
| **GPT-4o Vision / Gemini Vision** | Cloud API | Excellent | Pay-per-use | ✅ Yes |

**Recommendation for hackathon:**
1. **Primary:** Use **Gemini 2.0 Flash Vision API** (multimodal — send the image directly, get text back). Handles handwriting, Hindi, English, and diagrams. Free tier available.
2. **Fallback:** **Tesseract.js** running in the browser (zero server, but only works for typed/printed text, not handwriting).

**Hindi board reading:** All of the above support Devanagari script. Gemini Vision handles mixed Hindi+English boards natively.

**The Braille Document Output:**
- Each OCR pass appends new text to a running **Braille transcript document**.
- The document auto-converts English text → Grade 1 Braille dot notation.
- Hindi text → Bharati Braille notation.
- Student can export this as a **downloadable Braille-ready PDF** after class.

---

### 6. 📄 PDF Textbook OCR & Reader (for Blind Mode)

**Problem:** Scanned textbook PDFs are just images — screen readers can't read them.

**Solution:**
- Teacher uploads a PDF.
- Backend runs OCR on each page (Tesseract / PaddleOCR / Google Vision).
- Extracted text is structured into paragraphs and headings.
- Sent to the blind student's browser → TTS reads it aloud.
- Student navigates by **paragraph** (↑↓ arrows), **sentence** (←→ arrows), or **word** (Ctrl+←→).

**Model:** `PaddleOCR` for backend batch processing (free, supports Hindi+English, handles scanned pages well).

---

### 7. 🎤 Enhanced Speech Recognition (Whisper vs. Web Speech API)

**Problem:** The Web Speech API (what we currently use) is decent but:
- Drops words in noisy classrooms.
- Handles Hindi poorly compared to English.
- Requires internet (it sends audio to Google's servers).

**Solution:** Use **OpenAI Whisper** for higher accuracy:

| Feature | Web Speech API | Whisper (large-v3) | Whisper (tiny) |
|---|---|---|---|
| Accuracy (English) | Good | Excellent | Good |
| Accuracy (Hindi) | Fair | Excellent | Good |
| Noise robustness | Poor | Excellent | Good |
| Runs offline | ❌ | ✅ (local) | ✅ (in-browser WASM) |
| Latency | Real-time | ~2s per chunk | ~500ms per chunk |
| Cost | Free | Free (self-hosted) | Free |

**Recommendation:**
- **Hackathon:** Keep Web Speech API (zero setup, works now).
- **Production:** Run `whisper-tiny` or `whisper-small` via `whisper.cpp` compiled to WASM — runs entirely in the browser, better Hindi accuracy, works offline.

---

### 8. 📳 Braille Haptics — Can We Do This?

**The honest answer: partially yes, with creative workarounds.**

**What we CANNOT do:**
- Make a phone screen raise physical Braille pins. That requires a refreshable Braille display (₹1,50,000+ hardware).
- Provide true tactile dot-by-dot feedback through software alone.

**What we CAN do:**

#### Option A: Vibration Patterns (Web Vibration API)
```javascript
// Example: Braille letter "a" = dot 1 only
// Short buzz = dot present, silence = dot absent
navigator.vibrate([100, 50, 0, 50, 0, 50,  // dots 1,2,3 (left column)
                    100,                      // pause
                    0, 50, 0, 50, 0]);        // dots 4,5,6 (right column)
// Pattern: BUZZ-silent-silent | silent-silent-silent = dot 1 only = "a"
```

Each Braille cell has 6 dots arranged in 2 columns of 3. We can encode each dot as:
- **Short vibration** = dot is raised (present)
- **Silence** = dot is empty (absent)
- **Longer pause** = column separator

A blind student holds their phone and **feels the Braille pattern** as a sequence of vibrations.

**Limitations:** This is slow (takes ~1 second per character) and requires practice to interpret. But it's **real, working haptic Braille output from a standard phone** — no special hardware.

#### Option B: Audio Haptics (Spatial Clicks)
Instead of vibration, use **stereo audio**:
- Dot 1 (top-left) = click in left ear, high pitch
- Dot 2 (mid-left) = click in left ear, mid pitch
- Dot 3 (bottom-left) = click in left ear, low pitch
- Dot 4 (top-right) = click in right ear, high pitch
- Dot 5 (mid-right) = click in right ear, mid pitch
- Dot 6 (bottom-right) = click in right ear, low pitch

Using the **Web Audio API** with stereo panning, the student wearing headphones hears a spatial representation of each Braille cell. This is faster than vibration and more distinguishable.

#### Option C: WebHID for Physical Braille Displays
If the school has a refreshable Braille display (e.g., Orbit Reader 20, BrailleNote):
- Use the **WebHID API** (Chrome 89+) to connect via USB or Bluetooth.
- Send Braille cell data directly to the display's pins.
- Receive key input from the display's Braille keys.

This is the **gold standard** but requires hardware.

**Recommendation for hackathon:**
- Implement **Option A (Vibration)** + **Option B (Audio Haptics)** — both work on standard phones/laptops with zero hardware.
- Mention **Option C (WebHID)** in the pitch as a "production integration path" for schools that have the hardware.

---

### 9. 📝 Smart Lesson Summarisation (Gemini API)

**Problem:** After a 45-minute lecture, a student wants a concise summary for revision.

**Solution:**
- Collect all classroom broadcast text from the session (already stored in `localStorage`).
- Send to **Gemini 2.0 Flash** with prompt: *"Summarise this 45-minute classroom lecture into 5 key bullet points suitable for a student's revision notes."*
- Display the summary in both text (for deaf) and TTS (for blind).

**Model:** Gemini 2.0 Flash (handles long context, free tier, fast).

---

### 10. 🔍 Silent Handshake — Auto-Detect Impairment (Heuristic + Optional ML)

**Problem:** How does the app know if the user is blind or deaf without asking?

**Current approach (heuristic):**
- On the landing page, play an audio tone AND show a visual prompt simultaneously.
- If the user **clicks the visual prompt** → they can see → route to Deaf Mode.
- If the user **presses spacebar** (as a screen reader user would) → they can't see → route to Blind Mode.

**ML enhancement (optional):**
- Track the first 5 seconds of user interaction: mouse movement patterns, keyboard usage, screen reader detection via `aria` attribute reads.
- A simple **logistic regression** classifier trained on interaction patterns can predict with ~95% accuracy whether the user is using a screen reader (blind) or mouse (sighted/deaf).

**Recommendation:** The heuristic approach is elegant enough for the hackathon. ML adds unnecessary complexity here.

---

### 11. 🌐 Language Identification (Already Implemented — Google Translate API)

**Status:** ✅ Already built and working.

Our 3-tier detection pipeline:
1. Devanagari regex (zero-latency)
2. Google Translate API `/detect-lang` endpoint
3. Hinglish word dictionary fallback

**Potential upgrade:** Replace Google Translate API with a **local `fasttext` language ID model** — Facebook's `lid.176.ftz` model (917KB) can identify 176 languages in <1ms. Runs on the backend with zero API calls.

---

### 12. 📚 Content Adaptation — LLM Rewrites for Accessibility (Gemini API)

**Problem:** A teacher's slides contain dense academic text. This is hard for ISL translation (Deaf Mode) and hard for TTS narration (Blind Mode — long sentences are hard to follow aurally).

**Solution:** Run all incoming text through an **accessibility rewriter**:

For **Deaf Mode:** Simplify to ISL-friendly vocabulary (as described in #2).

For **Blind Mode:** Restructure for audio comprehension:
- Break long sentences into short, clear statements.
- Add verbal signposts: "First...", "Next...", "Finally..."
- Spell out abbreviations: "DNA" → "D-N-A, deoxyribonucleic acid"
- Describe mathematical notation verbally: "x²" → "x squared"

**Model:** Gemini 2.0 Flash with mode-specific system prompts.

---

## 🏗️ Recommended AI Tech Stack

| Layer | Tool | Purpose | Cost |
|---|---|---|---|
| **Hand tracking** | MediaPipe Hands JS | 21 landmarks per hand, in-browser | Free |
| **Gesture classifier** | XGBoost → ONNX Runtime Web | Classify ISL signs from landmarks | Free |
| **LLM (primary)** | Gemini 2.0 Flash API | Sentence simplification, summarisation, content adaptation | Free tier |
| **LLM (backup)** | GPT-4o-mini API | Backup LLM if Gemini quota exceeded | $0.15/1M tokens |
| **Board OCR** | Gemini Vision API | Whiteboard/blackboard text extraction (handwriting + Hindi) | Free tier |
| **PDF OCR** | PaddleOCR (Python backend) | Scanned textbook text extraction | Free |
| **Speech (current)** | Web Speech API | Real-time speech-to-text | Free |
| **Speech (upgrade)** | Whisper.cpp → WASM | Better accuracy, offline, Hindi support | Free |
| **Language ID** | Google Translate API (current) | Hindi/English detection | Free |
| **Language ID (upgrade)** | fasttext lid.176.ftz | 176-language detection, <1ms, offline | Free |
| **NLP parsing** | spaCy (Python backend) | POS tagging for SOV reordering | Free |
| **Embeddings** | all-MiniLM-L6-v2 | Context disambiguation for polysemous words | Free |
| **Haptics** | Web Vibration API + Web Audio API | Braille cell vibration/audio patterns | Free |

---

## 📊 What About Grok API?

**Grok (by xAI)** is a viable LLM alternative. Here's how it compares:

| Feature | Gemini 2.0 Flash | Grok-2 | GPT-4o-mini |
|---|---|---|---|
| Speed | ~200ms | ~400ms | ~300ms |
| Hindi quality | Excellent | Good | Good |
| Free tier | ✅ Generous | ❌ Paid only | ❌ Paid only |
| Vision (for OCR) | ✅ Native | ✅ Native | ✅ Native |
| Best for | Primary choice | Alternative | Backup |

**Verdict:** Grok works but **Gemini is the better choice** for this project — free tier, fastest, best Hindi support, and it's Google's ecosystem (same as MediaPipe, TensorFlow.js, and Chrome APIs we're already using).

If you want to showcase **multiple AI providers** in the pitch (judges love this), you could use:
- **Gemini** for sentence simplification
- **Grok** for lesson summarisation
- **MediaPipe + XGBoost** for sign recognition

This demonstrates "AI-agnostic architecture" — impressive for a technical evaluation.

---

## 🎯 Priority Order for Implementation

### Week 1 (Hackathon Sprint)
1. ✅ **Board OCR** (Gemini Vision API) — biggest visual impact for demo
2. ✅ **ISL Sign Recognition** (MediaPipe + XGBoost) — the showstopper demo moment
3. ✅ **Braille Haptics** (Vibration API) — judges can literally feel it on their phone

### Week 2 (Polish)
4. **Sentence Simplification** (Gemini API) — improves ISL quality dramatically
5. **Smart Summarisation** (Gemini API) — great end-of-demo moment
6. **Emotion Overlay** (Web Audio prosody) — visual wow factor

### Post-Hackathon
7. **Whisper upgrade** for better speech recognition
8. **Context disambiguation** with embeddings
9. **WebHID Braille display integration**
10. **Full content adaptation pipeline**

---

## 💡 Open Questions

- **[ ] Discuss**: Gemini API key management — one project key or per-deployment?
- **[ ] Discuss**: Should XGBoost model training be a one-time script or a live "calibration" mode where the student records their own signs?
- **[ ] Discuss**: Board OCR — do we use the teacher's phone camera, a fixed classroom webcam, or screen-share capture?
- **[ ] Discuss**: Braille haptics — should vibration patterns be configurable (speed, intensity) or fixed?
- **[ ] Discuss**: Do we want to use Grok alongside Gemini for the "multi-AI" pitch angle?

---

*Last updated: August 2026 | Indriya Team*
