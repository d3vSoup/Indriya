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

## 💡 The Problem

In a typical Indian classroom, educational infrastructure struggles to support sensory-impaired students:
- **Deaf students** miss out on vocal lectures because sign language interpreters aren't present. Existing tools focus on ASL (American Sign Language), ignoring the 18 million Deaf people in India who use **ISL (Indian Sign Language)**.
- **Blind students** can hear the lecture, but can't see board notes, slides, or type digital responses without expensive physical Braille displays. 

## 🚀 The Solution: Indriya

Indriya bridges these gaps through two powerful, browser-based environments that require **zero specialized hardware**.


---

## 🤝 Deaf Mode

A **live classroom broadcast system** that translates a teacher's spoken Hindi or English into grammatically correct Indian Sign Language (ISL) animations in real-time.

<p align="center">
  <img src="docs/assets/deaf_mode.png" alt="Deaf Mode Screenshot" width="900" style="border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);"/>
</p>

### ⭐ Key Features
- **ISL-First & Bilingual:** Translates code-switched Hindi/English into real ISL signs, using a curated dictionary of real human hand photos and GIFs (No "uncanny valley" 3D avatars).
- **Correct SOV Grammar:** Reorders English (Subject-Verb-Object) to ISL's natural grammar (Subject-Object-Verb).
- **Passive Broadcast Architecture:** The teacher speaks into a mic; the ISL animations instantly appear on every deaf student's screen via WebSockets.
- **Works with Zoom/Meet:** Supports multiple input modes including pasting live captions directly.

---

## 👁️ Blind Mode

A **native digital Braille environment** that allows blind students to take notes, hear board content, and interact with the classroom using just a standard laptop keyboard.

<p align="center">
  <img src="docs/assets/blind_mode.png" alt="Blind Mode Screenshot" width="900" style="border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);"/>
</p>

### ⭐ Key Features
- **Virtual Perkins Brailler:** Use `S-D-F` and `J-K-L` to type standard 6-dot Braille directly on any keyboard. No ₹45,000 hardware required!
- **Audio-First Design:** Complete TTS integration. Every key press and command produces clear auditory feedback and spatial audio cues.
- **Live Classroom Feed:** When the teacher types board notes, the text is broadcast to the blind student and read aloud instantly.
- **Bi-Directional Communication:** The student types in Braille, and the system translates it back to English text for the teacher to read.

---

## 🧠 AI / ML Strategy

Indriya leverages AI as an **invisible infrastructure** to make the experience seamless.
Highlights include:
- **Board OCR:** Point a phone camera at a blackboard, and Gemini Vision extracts handwriting to broadcast to both Deaf and Blind modes.
- **Two-Way Signing:** Uses **MediaPipe + XGBoost** to let deaf students sign back via webcam.
- **Sentence Simplification:** LLMs re-write complex academic jargon into simpler terms for higher ISL dictionary coverage.

<p align="center">
  <img src="docs/assets/features.png" alt="Features Screenshot" width="900" style="border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);"/>
</p>

---

## 🖼️ Education Without Limits

<p align="center">
  <img src="docs/assets/gallery.png" alt="Gallery Screenshot" width="900" style="border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);"/>
</p>

---

## 💻 Technology Stack

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=html,css,js,tailwind,python,fastapi,supabase,opencv,n8n&theme=light" alt="Tech Stack Icons" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Gemini_Vision-AI%20%7C%20OCR-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini Vision" />
  <img src="https://img.shields.io/badge/MediaPipe-Hand_Tracking-00897B?style=for-the-badge&logo=google&logoColor=white" alt="MediaPipe" />
  <img src="https://img.shields.io/badge/XGBoost-Sign_Classifier-FF6600?style=for-the-badge&logo=xgboost&logoColor=white" alt="XGBoost" />
  <img src="https://img.shields.io/badge/Web_Speech_API-STT%20%7C%20TTS-8B5CF6?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Web Speech API" />
</p>

- **Frontend:** Vanilla HTML/JS, TailwindCSS, Web Speech API, `SpeechSynthesis` API.
- **Backend:** Python, FastAPI, WebSockets, Uvicorn.
- **ML Pipeline:** MediaPipe (hand landmark extraction) → OpenCV (frame processing) → XGBoost (ISL sign classifier).
- **AI / LLM:** Gemini Vision (Board OCR & sentence simplification).
- **Automation:** n8n (workflow orchestration for data pipelines).
- **Assets/CDN:** Supabase Storage (hosting 250+ ISL animation GIFs + Indriya logo).
- **Deployments:** Vercel (Frontend), Render (Backend).

---

<br>

<div align="center">
  <i>Built with ❤️ for inclusive education in India — by the Indriya team.</i>
</div>
