<div align="center">
  <img src="https://cnwsrgqlpvxxnwsndhsm.supabase.co/storage/v1/object/public/isl-gestures/branding/indriya_logo.png" alt="Indriya Logo" width="160"/>
  
  <br>

  [![Typing SVG](https://readme-typing-svg.demolab.com?font=Atkinson+Hyperlegible+Next&weight=800&size=32&pause=1000&color=7C5800&center=true&vCenter=true&width=600&lines=Empowering+Deaf+Classrooms;Empowering+Blind+Classrooms;Inclusivity+is+not+a+toggle)](https://git.io/typing-svg)
  
  *A unified platform empowering Deaf and Blind students in Indian classrooms.*
  
  <br>

  [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://indriya-edu.vercel.app/)
  [![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://bharat-shakti-backend.onrender.com/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Supabase](https://img.shields.io/badge/CDN-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

  <br>
  
  <p align="center">
    <a href="https://indriya-edu.vercel.app/">
      <img src="docs/assets/hero.png" alt="Homepage Screenshot" width="900" style="border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);"/>
    </a>
  </p>
</div>

---

## <img src="https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/Lightbulb/SVG/ic_fluent_lightbulb_24_regular.svg" width="24" height="24" align="center"> The Problem

In a typical Indian classroom, educational infrastructure struggles to support sensory-impaired students:
- **Deaf students** miss out on vocal lectures because sign language interpreters aren't present. Existing tools focus on ASL (American Sign Language), ignoring the 18 million Deaf people in India who use **ISL (Indian Sign Language)**.
- **Blind students** can hear the lecture, but can't see board notes, slides, or type digital responses without expensive physical Braille displays. 

## <img src="https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/Rocket/SVG/ic_fluent_rocket_24_regular.svg" width="24" height="24" align="center"> The Solution: Indriya

Indriya bridges these gaps through two powerful, browser-based environments that require **zero specialized hardware**.

<p align="center">
  <img src="docs/assets/lower.png" alt="Visual Stories Screenshot" width="900" style="border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);"/>
</p>

---

## <img src="https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/Handshake/SVG/ic_fluent_handshake_24_regular.svg" width="24" height="24" align="center"> Deaf Mode

A **live classroom broadcast system** that translates a teacher's spoken Hindi or English into grammatically correct Indian Sign Language (ISL) animations in real-time.

<p align="center">
  <img src="docs/assets/deaf_mode.png" alt="Deaf Mode Screenshot" width="900" style="border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);"/>
</p>

### <img src="https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/Star/SVG/ic_fluent_star_24_regular.svg" width="20" height="20" align="center"> Key Features
- **ISL-First & Bilingual:** Translates code-switched Hindi/English into real ISL signs, using a curated dictionary of real human hand photos and GIFs (No "uncanny valley" 3D avatars).
- **Correct SOV Grammar:** Reorders English (Subject-Verb-Object) to ISL's natural grammar (Subject-Object-Verb).
- **Passive Broadcast Architecture:** The teacher speaks into a mic; the ISL animations instantly appear on every deaf student's screen via WebSockets.
- **Works with Zoom/Meet:** Supports multiple input modes including pasting live captions directly.

> **Read the deep-dive:** [Deaf Mode USPs & Roadmap (deaf.md)](deaf.md)

---

## <img src="https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/Eye/SVG/ic_fluent_eye_24_regular.svg" width="24" height="24" align="center"> Blind Mode

A **native digital Braille environment** that allows blind students to take notes, hear board content, and interact with the classroom using just a standard laptop keyboard.

<p align="center">
  <img src="docs/assets/blind_mode.png" alt="Blind Mode Screenshot" width="900" style="border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);"/>
</p>

### <img src="https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/Star/SVG/ic_fluent_star_24_regular.svg" width="20" height="20" align="center"> Key Features
- **Virtual Perkins Brailler:** Use `S-D-F` and `J-K-L` to type standard 6-dot Braille directly on any keyboard. No ₹45,000 hardware required!
- **Audio-First Design:** Complete TTS integration. Every key press and command produces clear auditory feedback and spatial audio cues.
- **Live Classroom Feed:** When the teacher types board notes, the text is broadcast to the blind student and read aloud instantly.
- **Bi-Directional Communication:** The student types in Braille, and the system translates it back to English text for the teacher to read.

> **Read the deep-dive:** [Blind Mode Features & Roadmap (blind.md)](blind.md)

---

## <img src="https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/Brain/SVG/ic_fluent_brain_circuit_24_regular.svg" width="24" height="24" align="center"> AI / ML Strategy

Indriya leverages AI as an **invisible infrastructure** to make the experience seamless.
Highlights include:
- **Board OCR:** Point a phone camera at a blackboard, and Gemini Vision extracts handwriting to broadcast to both Deaf and Blind modes.
- **Two-Way Signing:** Uses **MediaPipe + XGBoost** to let deaf students sign back via webcam.
- **Sentence Simplification:** LLMs re-write complex academic jargon into simpler terms for higher ISL dictionary coverage.

<p align="center">
  <img src="docs/assets/features.png" alt="Features Screenshot" width="900" style="border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);"/>
</p>

> **Read the deep-dive:** [AI & ML Integration Strategy (ai.md)](ai.md)

---

## <img src="https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/Image/SVG/ic_fluent_image_24_regular.svg" width="24" height="24" align="center"> Education Without Limits

<p align="center">
  <img src="docs/assets/gallery.png" alt="Gallery Screenshot" width="900" style="border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);"/>
</p>

---

## <img src="https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/Code/SVG/ic_fluent_code_24_regular.svg" width="24" height="24" align="center"> Technology Stack

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=html,css,js,tailwind,python,fastapi,supabase&theme=light" alt="Tech Stack" />
  </a>
</p>

- **Frontend:** Vanilla HTML/JS, TailwindCSS, Web Speech API, `SpeechSynthesis` API.
- **Backend:** Python, FastAPI, WebSockets, Uvicorn.
- **Assets/CDN:** Supabase Storage (hosting 250+ ISL animation GIFs + Indriya logo).
- **Deployments:** Vercel (Frontend), Render (Backend).

---

## <img src="https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/Settings/SVG/ic_fluent_settings_24_regular.svg" width="24" height="24" align="center"> How to Run Locally

### 1. Backend Setup (FastAPI WebSocket Server)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the WebSocket server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
# You can use any static server, e.g., Python's built-in server:
python -m http.server 3000
```
Open `http://localhost:3000` in your browser.

> **Note:** The frontend automatically checks if it's running on `localhost` to connect to `ws://localhost:8000`. When deployed, it defaults to the production Render WebSocket URL.

---

<br>

<div align="center">
  <i>Built with ❤️ for inclusive education in India — by the Indriya team.</i>
</div>
