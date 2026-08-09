# Indriya — What It Needs to Be WOW

> This is an honest audit. Based on what's actually built in the codebase right now vs. what judges will see and feel during a live demo. Written after reading every HTML, MD, and Python file.

---

## 🔍 What's Actually Built Right Now (Honest Assessment)

### ✅ Working and solid
- Landing page with Silent Handshake (spacebar → blind, click → deaf)
- Deaf mode: Live mic transcription → ISL sign rendering → SOV grammar reordering
- Deaf mode: Paste caption + clipboard auto-watch modes
- Deaf mode: Speed control, dialogue log, PDF export, fingerspell fallback
- Blind mode: Perkins 6-dot Braille keyboard (S D F J K L + SPACE)
- Blind mode: TTS audio feedback per dot + per committed character
- Blind mode: Hindi (Bharati) Braille mode toggle
- Blind mode: Board OCR → TTS announcement (via WebSocket)
- Backend: FastAPI + WebSocket broadcast, language detection, Gemini board OCR

### ⚠️ Listed in the UI but not functional
- **MediaPipe Hands** (shown in tech section on landing page — not wired up)
- **WASM Braille Engine** (listed on landing page as a feature — not built)
- **Groq / Sentence Simplification** — not connected yet
- **Qwen3-VL / Together AI OCR** — still using Gemini only

### ❌ Missing entirely (high judge impact)
- No "Summarise Lesson" button anywhere in the UI
- No emotion/tone overlay on ISL viewer
- No Teacher Sign Preview before broadcast
- No bookmark / highlight feature in dialogue log
- No live ISL coverage % indicator
- No mobile haptics (vibration patterns for Braille)

---

## 🚀 WOW Factor — What to Build & Why

> Prioritised by **judge impact per hour of effort**. Focus on things that are *visible and demonstrable* in 5 minutes.

---

### 🥇 Priority 1 — Things That Create a "Holy Shit" Moment

#### 1. AI Simplification Bar in Deaf Mode UI
**What:** A small panel that shows the teacher's original sentence and the AI-simplified ISL version side by side.
> *"Photosynthesis is the biochemical process..."*
> ↓ **Groq rewrites to →** `PLANT SUNLIGHT FOOD MAKE`

**Why WOW:** You can *watch* the AI think on screen. Judges understand ISL instantly. The before/after is undeniable proof that AI is improving accessibility — not just decorating it.

**Effort:** 1–2 hours (backend `/api/simplify` + 10 lines of UI)

---

#### 2. ISL Coverage % Badge (Teacher Sign Preview)
**What:** Before ISL renders on student screen, show a badge on the teacher side: `"78% covered — 3 words will be fingerspelled"`. Teacher can rephrase before broadcasting.

**Why WOW:** This gives the teacher *agency*. It shows judges that the system is *intelligent*, not just a dumb word-lookup. It also teaches the teacher to speak better for deaf students — which is an education insight, not just a tech feature.

**Effort:** 30 minutes (count which words hit the dict vs fingerspell before animating)

---

#### 3. Emotion Overlay on ISL Stage
**What:** The dark ISL Stage background (`#islStage`) gets a coloured glow based on the teacher's vocal emotion:
- 🔴 Red pulsing glow = urgent/loud voice
- 💙 Blue ambient glow = calm explanation
- 💛 Gold shimmer = excited/positive

**Why WOW:** Completely silent students in the demo room will *see* the emotion change in real-time as you speak louder/softer. It's visceral. Nobody expects it.

**Effort:** 1 hour (Web Audio API + CSS animation classes)

---

#### 4. Lesson Summarise Button (End-of-Class Moment)
**What:** A "Summarise Lesson" button in the Dialogue Log panel. Sends the session's stored text to Groq → gets 5 bullet point revision notes → displays them in a modal. For Blind Mode: TTS reads them aloud.

**Why WOW:** This is the *perfect demo closer*. After you've shown the live translation working, you hit Summarise. The AI generates a clean study guide from the session in 2 seconds. Judges feel the complete loop: lecture → translation → revision.

**Effort:** 1.5 hours (backend `/api/summarise` + modal in both pages)

---

#### 5. Braille Haptics Demo (Phones in the Room)
**What:** In Blind Mode, when a Braille character is committed, call `navigator.vibrate()` with a pattern encoding the 6 dots. Judge picks up their phone, visits the URL, types `A` in Braille — feels it in their hand.

**Why WOW:** Physical. Tactile. Completely different from anything else in the room. Nobody at SIH has ever had a judge *feel* the output of their software on their phone.

**Effort:** 30 minutes (10 lines of JS, the vibration patterns are documented in `ai.md`)

```javascript
const BRAILLE_VIBRATE = {
  'a': [100, 50, 0, 50, 0, 50, 100, 0, 0, 50, 0, 50],  // dot 1 only
  // etc.
};
navigator.vibrate(BRAILLE_VIBRATE[char]);
```

---

### 🥈 Priority 2 — Makes the Project Feel Complete & Polished

#### 6. Live "Board is Active" Banner
**What:** When the teacher sends a board OCR result via WebSocket, the student screen shows a highlighted golden banner: *"📋 New board content: [text]"* that fades away after 5 seconds — in addition to the existing TTS announcement in Blind Mode.

**Why:** Right now, blind mode announces via TTS but there's no visual confirmation on the deaf mode side. This bridges it.

**Effort:** 15 minutes

---

#### 7. Bookmark Button in Dialogue Log
**What:** A ⭐ button on each dialogue entry. Bookmarked entries export highlighted in yellow in the PDF. In Blind Mode: pressing `B` bookmarks the last TTS entry.

**Why:** Turns the PDF from a passive transcript into a study guide. Teachers and judges immediately understand the value.

**Effort:** 45 minutes (localStorage flag + PDF highlight logic)

---

#### 8. Real "Connecting / Connected / Offline" WebSocket Status
**What:** The `wsStatus` pill in `deaf.html` already exists in the HTML. Make it actually reflect real connection state with proper animations — green dot pulsing = connected, red = offline, yellow = reconnecting.

**Why:** Currently the dot is static. During a live demo, judges WILL check if the WebSocket is actually live. A static "Connecting…" badge that never changes is an instant credibility hit.

**Effort:** 20 minutes (already in the code, just wire the events properly)

---

#### 9. Teacher Sign Preview Panel (Gloss + Coverage Before Broadcast)
**What:** Add a small "Preview" collapsible below the translate button in Deaf Mode. Shows:
- Gloss sequence: `STUDENT | BOOK | READ` (SOV order)
- Coverage badge: `8/10 words have ISL signs`
- Which words will fingerspell (shown in red)

The teacher can tweak their sentence before hitting broadcast.

**Effort:** 1 hour (reuse existing ISL engine without animating, just query the results)

---

### 🥉 Priority 3 — Landing Page & Pitch Polish

#### 10. Fix the Landing Page: Remove Placeholder Claims
**Problem:** The landing page currently lists **"C++ WASM Offline Engine"** and **"MediaPipe Hands JS"** as working features. Neither is implemented. If a technical judge asks for a demo of these, it will instantly damage credibility.

**Fix:** Either build them (WASM is hard, MediaPipe is feasible in 2 days) or change the text to *"Planned: C++ WASM Engine"* and *"Upcoming: MediaPipe Sign Recognition"*.

**Effort:** 10 minutes to fix the text. Days to actually build.

---

#### 11. Live Stats Counter on Landing Page
**What:** Animate three counter pills on the landing page:
- `18M+` deaf people in India who use ISL
- `150+` ISL signs in our dictionary
- `<50ms` WebSocket broadcast latency

**Why:** Social proof + technical credibility. These are real numbers from your own docs. Show them visually.

**Effort:** 30 minutes

---

#### 12. A "Try It Live" Demo Section on Landing Page
**What:** An embedded iframe or a demo panel directly on `index.html` that lets a visitor type a sentence and see it translated to ISL gloss without going to `deaf.html`. No sign-up, no navigation — instant magic.

**Why:** Judges at SIH often don't have time to deep-dive. If the first page they see does something incredible, they stop scrolling. This is that moment.

**Effort:** 1.5 hours (embed the ISL engine logic into index.html demo widget)

---

## 🧠 The Single Most Important Non-Technical Thing

### Fix the Demo Script — Practice the 5-Minute Flow

The best tech demo fails without a rehearsed story. Here's the ideal 5-minute judge walkthrough:

1. **00:00** — Open `index.html`. Say: *"Our system detects your accessibility needs automatically."* Press Spacebar → Blind Mode opens. Press Back. Click → Deaf Mode opens.

2. **01:00** — In Deaf Mode, speak: *"The mitochondria is the powerhouse of the cell."* Judge sees fingerspelling (complex word). Then say: *"Watch what happens when AI simplifies this."* Show Groq simplification → *"CELL POWER MAKE"* → real ISL signs appear. 

3. **02:00** — While ISL is showing, speak louder for emphasis. The emotion overlay changes to red pulsing border. Judge notices.

4. **03:00** — Hit "Summarise Lesson". Groq produces 5 bullet points. *"Every deaf student now has a study guide from today's lecture — automatically."*

5. **04:00** — Switch to Blind Mode. Type `S` + `SPACE` → *"a"* is spoken. Hand the judge their phone on the live URL. They type `S` + `SPACE`. They feel a vibration pattern. *"That was the Braille pattern for the letter A — felt in your hand."*

6. **05:00** — *"This runs in any browser. No app. No hardware. Just a URL."*

---

## 📋 Summary Table

| Feature | Impact | Effort | Status |
|---|---|---|---|
| AI Simplification Bar in UI | 🔥🔥🔥 | 2 hrs | ❌ Not built |
| ISL Coverage % Badge | 🔥🔥🔥 | 30 min | ❌ Not built |
| Emotion Overlay (Web Audio) | 🔥🔥🔥 | 1 hr | ❌ Not built |
| Lesson Summarise Button | 🔥🔥🔥 | 1.5 hrs | ❌ Not built |
| Braille Haptics (vibration) | 🔥🔥🔥 | 30 min | ❌ Not built |
| Board OCR → Deaf Mode banner | 🔥🔥 | 15 min | ❌ Not wired |
| Bookmark ⭐ in dialogue log | 🔥🔥 | 45 min | ❌ Not built |
| Fix WebSocket status pill | 🔥🔥 | 20 min | ⚠️ UI exists, logic broken |
| Teacher Sign Preview panel | 🔥🔥 | 1 hr | ❌ Not built |
| Fix landing page false claims | 🔥🔥🔥 | 10 min | ⚠️ Urgent — credibility risk |
| Live stats counter | 🔥 | 30 min | ❌ Not built |
| Demo widget on landing page | 🔥🔥 | 1.5 hrs | ❌ Not built |
| Groq + Together AI wired up | 🔥🔥🔥 | 1 hr | ❌ Not built (see AI_FEATURES.md) |

---

*Last updated: August 2026 | Indriya Team*
