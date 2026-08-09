# Indriya — Deaf Mode: USP, Differentiation & Design Philosophy

> This is a living document. It captures our ongoing discussions about what makes the Deaf Mode genuinely unique, how it differs from existing tools, and how we frame it for the pitch.

---

## 🔑 The Core USP — What Makes This Genuinely Different

### 1. It Solves ISL (Indian Sign Language) — Not ASL
**This is the biggest one.**

Almost every sign language app in existence solves for **ASL (American Sign Language)** or **BSL (British Sign Language)**. The deaf community in India uses **ISL — Indian Sign Language** — which has its own completely distinct vocabulary, grammar, and regional variations.

ISL is spoken by **approximately 18 million deaf people in India**, yet there is nearly zero production-grade tooling built specifically for it. We are one of the very few projects that:
- Uses **real ISL gesture datasets** (not ASL repurposed for India).
- Has **real ISL animated GIFs** of actual hand gestures from Indian practitioners.
- Maps **Devanagari Hindi script characters** to their corresponding ISL signs.

**Existing tools ignore this entirely.** Spread the Sign, Signily, and others are ASL/BSL-first, with minimal and incomplete ISL coverage.

---

### 2. It Is a Classroom Broadcast System, Not an App

**Every existing sign language tool is a 1-person lookup tool.**

You open an app, you search a word, you see a sign. That's it.

**What we built is fundamentally different:**
- The **teacher speaks** at the front of the classroom.
- A **WebSocket broadcast system** sends ISL translations **simultaneously** to **every deaf student's screen** in real-time.
- Students do not need to do anything — the system is **passive for the student**.

This is a **synchronous classroom broadcast architecture** — not a dictionary. The analogy is the difference between a dictionary and a live interpreter at a lecture.

No existing product in the Indian EdTech market does this.

---

### 3. It Speaks Both Hindi AND English (With Real-Time Switching)

**Indian classrooms are inherently bilingual.** Teachers switch fluidly between Hindi and English mid-sentence (code-switching / Hinglish). Existing tools handle one language at a time.

Our 3-tier auto-detection pipeline handles this in real-time:
1. **Devanagari script regex** — instant detection if Hindi characters are present.
2. **Google Translate API** via backend — confirms language with confidence scoring.
3. **Hinglish dictionary fallback** — catches romanized Hindi words like "namaste", "shikshak", "dhanyawad".

This means a teacher can say *"Today हम पढ़ेंगे about photosynthesis"* and our system handles both words correctly in the same sentence — routing Hindi words to Hindi ISL signs and English words to English ISL signs.

No existing real-time speech-to-sign tool handles bilingual Hindi+English switching.

---

### 4. ISL Grammar is Linguistically Correct (SOV, Not SVO)

**This is the difference between a toy and a real tool.**

English uses **Subject-Verb-Object (SVO)** grammar: *"The student reads the book."*  
ISL uses **Subject-Object-Verb (SOV)** grammar: *"STUDENT BOOK READ."*

Every naive "sign language translator" just converts word-by-word in English order — which is **grammatically wrong** in ISL and produces incomprehensible output to a fluent ISL user.

Our NLP pipeline:
- Removes filler words (articles, auxiliary verbs, connectors).
- Reorders the sentence into correct ISL SOV structure.
- Applies stopword filtering appropriate for sign language (no "is", "the", "a", "are").

This linguistic accuracy is something that would impress a deaf ISL user — not just a judge.

---

### 5. Zero Hardware, Zero Installation, Runs in Any Browser

The biggest barrier to accessibility tools in Indian schools is **hardware and infrastructure constraints**.

Our platform:
- Runs entirely in the **browser** using the native **Web Speech API** — no app download, no plugins.
- Works on a **₹8,000 Android phone** or a school projector's laptop.
- Requires **zero setup** for students — they just open the URL.
- Works even on **slow internet** because all heavy assets (sign images/GIFs) are pre-cached from CDN on first load.

This makes it usable in **Tier-2 and Tier-3 Indian schools** where budget hardware is the norm.

---

### 6. Three Teacher Input Modes — Plugs Into Google Meet & Zoom

**No other tool gives the teacher flexibility of choice.** Indriya has three distinct input modes:
- **🎙️ Live Mic** — Teacher speaks directly, Web Speech API transcribes instantly.
- **📋 Paste Caption** — Teacher copies captions from Google Meet or Zoom, pastes them, and ISL renders immediately.
- **👁️ Auto-Watch** — System auto-monitors the screen for caption overlays in real-time.

This means Indriya integrates with the tools teachers **already use** — no workflow change required. A deaf student in a remote Zoom class, or sitting in a hybrid classroom, gets ISL without the teacher doing anything differently.

---

### 7. Real Photographs, Not Cartoon Avatars

**The deaf community has an established preference: photorealistic hands over cartoons.**

Most sign language apps use 3D avatars or SVG cartoon hands to avoid licensing costs. Research on deaf community UX consistently shows avatar-based sign rendering suffers from the **"uncanny valley" effect** — it's harder to read, less natural, and reduces trust.

We made a deliberate design decision:
- **Stripped all cartoon SVG hands from the codebase entirely.**
- Use **real high-contrast hand photographs** from actual ISL practitioners.
- Use **genuine animated GIFs** of real human hands performing ISL gestures.

This matters not just aesthetically — it matters for **comprehension accuracy** and for the dignity of the community we are building for.

---

### 8. Session Archive → Exportable PDF (Accessibility Beyond Real-Time)

**Real-time translation solves the classroom moment. The archive solves the study session.**

Deaf students often miss nuances during fast-paced lectures. After a class ends, there is usually no record for them to revise from. We fix this:
- Every spoken dialogue entry is **timestamped and persisted for 1 hour** in the student's browser.
- The full session can be **exported as a clean, print-ready A4 PDF** at any time.
- The PDF includes speaker labels, timestamps, and ISL gloss text.

This is an **accessibility archive** — a record of the lesson that a deaf student can study from. No other sign language tool has this.

---

### 9. Never Goes Silent — Offline Fingerspelling Fallback

**An accessibility tool that fails silently is worse than useless — it's invisible and unfair.**

When our backend is offline, internet drops, or a word isn't in the ISL dictionary, the system has a guaranteed fallback:
- Automatically switches to **letter-by-letter fingerspelling** using real A–Z hand photos.
- 100% of content is always rendered visually — no word is ever skipped or silently dropped.
- The student always knows a word is being spelled (not just seeing a blank screen).

This offline-resilient design is critical for India's **variable connectivity environments** in rural and Tier-3 school settings.

---

### 10. Adjustable Sign Speed — Personalised Pace for Every Learner

**Sign language proficiency varies by student, just like reading speed.**

A child who has been deaf since birth and uses ISL daily reads signs much faster than a student who acquired deafness later. Our sign speed control (0.5s/sign to 3.0s/sign) allows:
- **Teachers to slow down** for students newer to ISL.
- **Advanced ISL readers to run it fast** without waiting.
- **Parents in home learning contexts** to replay at a comfortable pace.

This is the equivalent of font-size accessibility settings — but for signing speed. No other classroom ISL tool has per-session speed personalisation.

---

### 11. Zero Login, Zero Data Harvesting — Privacy-First by Design

**Students open a URL. That is the entire setup.**

In a school context — especially with minors — data privacy is a legal and ethical responsibility. We made a privacy-first decision from day one:
- **No account creation.** No email, no password, no profile.
- **No data sent to any third party** about student usage.
- All session data (dialogue log) stays in the **student's own browser** via `localStorage` and is auto-deleted after 1 hour.
- Backend APIs receive only short text snippets for language detection — never audio, never personal data.

This makes it deployable in **government schools, NGOs, and institutions** with strict PDPA/data privacy requirements — without legal review.

---

## 🧱 How It Compares to Existing Solutions

| Feature | **Indriya** | Google Live Transcribe | Spread the Sign | Academic ISL Projects |
|---|---|---|---|---|
| Language | **ISL (Indian)** | None (text only) | ASL / BSL (partial ISL) | ISL (research only) |
| Real-Time Classroom Broadcast | ✅ WebSocket multi-user | ❌ Single device | ❌ Single device | ❌ |
| Hindi + English bilingual | ✅ Auto-detect + switch | ❌ | ❌ | ❌ |
| ISL Grammar (SOV) | ✅ NLP pipeline | ❌ | ❌ | Partial (research) |
| Needs hardware/app | ❌ Browser-only | App required | App required | Research lab only |
| Google Meet / Zoom integration | ✅ Caption paste mode | ❌ | ❌ | ❌ |
| Real human hand photos | ✅ No avatars/cartoons | N/A | ❌ Avatars | ❌ Avatars |
| Session archive + PDF export | ✅ 1-hour log | ❌ | ❌ | ❌ |
| Offline fallback | ✅ Fingerspelling | ❌ | ❌ | ❌ |
| Sign speed control | ✅ 0.5x – 3x | ❌ | ❌ | ❌ |
| Zero login / privacy-first | ✅ | ❌ Account needed | ❌ Account needed | N/A |
| Free at point of access | ✅ | ✅ (limited) | ❌ (paid) | ❌ |
| Works in Indian classroom | ✅ | Partial | ❌ | ❌ |
| Open and deployable | ✅ | ❌ (proprietary) | ❌ | Partial |

---

## 🚀 Future Goals — What Would Make This Unstoppable

> *"What turns an impressive demo into a product that deaf students actually depend on?"*

### Tier 1: Near-Term & Built Features

#### 🔁 12. Two-Way Communication via MediaPipe (Student Signs Back) — *Planned (Moonshot)*
**Right now, communication is one-way: teacher speaks → student sees signs.**
What if the deaf student could **raise their hand, sign a question via their webcam**, and the teacher sees the text on their screen?
- Use **Google MediaPipe Hands** to track 21 hand landmarks in real-time.
- Classify detected hand poses against our ISL dictionary in reverse.

---

#### 🧠 13. AI Sentence Simplification (Complex → Sign-Friendly) — ✅ **BUILT (Phase 1 & 3)**
Academic language is complex. A teacher might say: *"Photosynthesis is the biochemical process by which chloroplasts convert solar radiation into glucose."*
- **Implementation**: Powered by Groq Llama 3.3 (`/api/simplify`). Rewrites sentences to simple ISL SOV text (e.g. `PLANTS CONVERT SUNLIGHT INTO GLUCOSE`).
- Displays raw vs. simplified text in a live **AI Simplification Bar** (`#simplifyBar`) in `deaf.html`.

---

#### 👁️ 14. Teacher Sign Preview & Coverage Badge — ✅ **BUILT (Phase 2 & 3)**
Before broadcasting/animating:
- **Coverage Badge (`#coverageBadge`)**: Displays real-time ISL gesture coverage percentage (e.g., `75% ISL (3/4 signs)`).
- **Sign Preview (`#glossRibbon`)**: Shows a `PREVIEW` banner with the SOV gloss breakdown immediately on speech capture.

---

#### ⭐ 15. Bookmark Moments During Lecture — ✅ **BUILT (Phase 3)**
- **Bookmark Button (`.bookmark-btn`)**: Click ⭐ on any dialogue entry to save it to `localStorage` with a warm gold highlight.
- **PDF Export**: Bookmarked entries are exported with a **⭐ column** and **highlighted gold background**.

---

### Tier 2: Medium-Term — Implemented & Stretch Goals

#### 🎭 16. Emotion & Tone Overlay (Web Audio Prosody Glow) — ✅ **BUILT (Phase 3)**
- Uses native **Web Audio API (`AnalyserNode`)** attached to the microphone stream.
- Dynamically renders an **emotional glow aura** around `#islStage`:
  - 🔵 **Calm/Soft** → Soft blue ambient glow
  - 🟡 **Moderate** → Warm amber glow
  - 🔴 **Loud/Urgent** → Pulsing red aura

---

#### 📚 17. Subject-Specific ISL Vocabularies — ✅ **BUILT (Phase 3)**
- 4-tab **Subject Mode** toggle in `deaf.html`: 📚 General / 🔬 Science / 📐 Maths / 🌍 Geography.
- Activates specialized ISL gloss dictionaries (e.g., Science maps "photosynthesis" → `PLANT FOOD MAKE`, Maths maps "equation" → `TWO SIDE EQUAL`).

---

#### 🗣️ 18. Contextual Sign Disambiguation

Many English words have multiple ISL signs depending on context:
- **"Bank"** → river bank (geography sign) vs. financial bank (money sign)
- **"Light"** → weight/light (adjective sign) vs. lamp/illumination (noun sign)
- **"Break"** → fracture/snap vs. rest/pause

Use the **surrounding sentence context** to pick the correct sign variant. A simple NLP model or even keyword-window heuristic can solve 80% of these cases.

This is the difference between a naive word-lookup and a **semantically aware translator**.

---

#### 🌍 19. Regional ISL Dialect Support

ISL is not fully standardised across India. The sign for "water" in Mumbai may differ from the sign in Delhi or Chennai.

Allow schools to configure their **regional dialect preference**:
- North India (Delhi/UP ISL conventions)
- West India (Mumbai/Gujarat ISL conventions)
- South India (Chennai/Bangalore ISL conventions)
- ISLRTC Standard (standardised dictionary from the Indian Sign Language Research and Training Centre)

This makes Indriya **culturally accurate**, not just linguistically accurate. It also opens the door for **community-contributed sign variants**.

---

#### 🤝 20. Deaf Student Peer Chat (Sign-to-Sign Breakout Rooms)

Two deaf students can join a private breakout room, sign to each other via their webcams (using MediaPipe), and each sees the other's signs translated to text.

**Why this matters:** Group work, discussions, and peer learning are standard in classrooms. Currently, deaf students are excluded from peer conversations. This feature gives them a native communication channel within the Indriya ecosystem.

---

### Tier 3: Moonshot — Long-Term Vision

#### 🎬 21. Generative ISL Avatar (Sign Any Sentence Fluidly)

Instead of showing discrete static images one-by-one, generate a **smooth, continuous signing animation** using a trained pose-generation model.

- Input: any English/Hindi sentence
- Output: a 3D avatar or video performing the complete sentence as one fluid ISL utterance — with proper transitions between signs, facial expressions, and mouth patterns.

This is the Holy Grail of sign language technology. Current academic research (e.g., SignGAN, MotionBERT) is making progress, but no one has deployed this for ISL at production quality.

If we build this, Indriya becomes not just a classroom tool but a **platform** — the ISL equivalent of Google Translate.

---

#### 📱 22. WhatsApp Bot for Deaf Families

Extend the ISL engine beyond the classroom:
- A parent sends a Hindi/English text message via WhatsApp.
- The bot converts it to a sequence of ISL sign images/GIFs and sends them back as a visual message.
- The deaf child reads the signs on their parent's phone.

This bridges the **communication gap at home** — not just at school. 75% of deaf children in India have hearing parents who don't know ISL. This bot becomes a daily communication bridge.

---

#### 🏫 23. ISL Learning Mode (Reverse the Tool)

Flip the entire system:
- Instead of translating speech → signs, use it to **teach hearing students ISL**.
- Show a sign, the hearing student guesses the word.
- Turn on the webcam, the student attempts the sign, MediaPipe checks if they got it right.
- Gamified with streaks, levels, and classroom leaderboards.

**Why this is powerful:** True inclusion isn't just making content accessible to deaf students — it's teaching hearing students to communicate in ISL. This promotes **bidirectional inclusion** and could be used in any school as a language class.

---

## 💡 Open Discussion Points

> *(Ongoing design decisions as we discuss them.)*

- **[ ] Discuss**: Should we add phoneme-level fingerspelling for words not in the ISL dictionary (e.g. proper nouns like "Einstein", "Maharashtra")?
- **[ ] Discuss**: How do we handle regional ISL dialect differences? (ISL is not fully standardized nationally.)
- **[ ] Discuss**: Can we add a "confidence score" shown to the teacher so they know when a translation is exact vs. fingerspelled approximation?
- **[ ] Discuss**: How do we showcase the SOV grammar transformation visually in the UI — perhaps a "gloss ribbon" showing the reordered words?
- **[ ] Discuss**: What LLM to use for sentence simplification — Gemini Nano (free, on-device) vs. GPT-4o-mini (cheap API)?
- **[ ] Discuss**: Should MediaPipe sign recognition (USP #12) run on the student's device or stream frames to the server?
- **[ ] Discuss**: For the WhatsApp bot — use Twilio or Meta's official WhatsApp Business API?

---

*Last updated: August 2026 | Indriya Team*

