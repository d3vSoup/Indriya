# Project Indriya: Inclusive Education AI Master Document

## 1. Project Overview & Hackathon Strategy
*   **Target Problem Statement:** PS4: Inclusive Education AI (Indriya)
*   **Core Concept:** A deeply inclusive, web-based educational ecosystem that dynamically auto-detects sensory impairments (blindness or deafness) and adapts its interface in real-time. 
*   **The Hackathon Pivot:** Shifted from native mobile (React Native/C++ NDK) to a **Web Application**. Attempting to build custom hardware drivers (like manipulating Mac/Windows trackpad haptics) in 7 days is a high-risk trap that often fails on demo day. A web-based architecture ensures zero hardware dependency, instant scalability, and a flawless live pitch.

---

## 2. Core Features & Technical Stack

### A. The "Silent Handshake" (Auto-Assessment Layer)
The platform does not force users through clunky "Are you blind?" menus. It infers needs seamlessly.
*   **Implementation:** 
    *   Use CSS Media Queries (`prefers-reduced-motion`, `forced-colors`) to check for OS-level accessibility flags.
    *   **Sensory Onboarding Test:** On launch, a combined audio and visual cue is presented. If the user intercepts using the spacebar (or a screen reader intercepts), it triggers Blind Mode. If they click visually, it triggers Deaf Mode.

### B. Deaf Mode: Real-Time Text-to-ISL
Translates a teacher's spoken lesson into real-time Indian Sign Language (ISL) avatars or video combinations.
*   **Implementation Stack:**
    *   **Frontend:** JavaScript with HTML5 **Web Speech API** (native browser speech recognition) to capture the teacher's voice without server latency.
    *   **Backend:** Python and FastAPI.
    *   **Workflow:** Captured text is sent to the backend, matched against an ISL dictionary, and corresponding video/avatar frames are streamed to the student.

### C. Blind Mode: Web-Based Perkins Braille Interface
Replaces standard visual keyboards with an accessible, audio-feedback Braille layout.
*   **Implementation Stack:**
    *   **Frontend Keyboard Mapping:** Standard QWERTY keys are remapped (`F`, `D`, `S` for dots 1, 2, 3 and `J`, `K`, `L` for dots 4, 5, 6). The spacebar executes the character.
    *   **Touchscreen Support:** Large HTML `<button>` touch zones mapped for tablet users with strict `aria-labels`.
    *   **Feedback:** The **Web Speech API** (`SpeechSynthesis`) speaks the letter aloud instantly upon execution to replace physical haptic vibrations.

---

## 3. Advanced Integrations (The Winning "Wow" Factors)

To push the project from "good" to an SIH winner, these deep-tech layers demonstrate enterprise-level complexity:

1.  **Two-Way Interaction (MediaPipe):** Instead of one-way learning, integrate Google's **MediaPipe Hands JS** in the browser. Capture the deaf student's hand landmarks via webcam to classify their signs back into text for the teacher.
2.  **Linguistic Depth (ISL Gloss NLP Pipeline):** English is Subject-Verb-Object (SVO). ISL is Subject-Object-Verb (SOV). Implement a Python NLP layer (spaCy) to parse English sentences into accurate ISL grammar before translation (e.g., "Student reads book" -> "BOOK STUDENT READ").
3.  **Real-Time Multi-Tenant Sync:** Use **FastAPI, WebSockets, and Redis Pub/Sub** to build a live broadcast architecture. Demonstrate a teacher speaking on one screen, while the Deaf UI and Blind UI update simultaneously on two other screens with sub-50ms latency.
4.  **C++ WASM Engine for Offline Support:** Write the core Braille algorithms and cell mapping in highly optimized C++ (using `long long` integers and strict syntax) and compile it to **WebAssembly (WASM)**. This allows the core engine to run locally in the browser even if conference Wi-Fi crashes.
5.  **RAG PDF Converter:** A backend pipeline where a teacher uploads a PDF. The system parses it into structured HTML for screen readers and pre-compiles a playlist of ISL signs for deaf students.

---

## 4. Potential Roadblocks & Defensive Strategies

| Threat/Problem | The Hackathon Solution |
| :--- | :--- |
| **Hardware/Driver Failure** | Abandon native NDK/OS hooks for trackpads. Utilize the Web Speech API and browser-based interfaces to guarantee cross-device compatibility. |
| **Expo Go / Build Crashes** | Bypassed entirely by building a modern Web App instead of a React Native mobile app. |
| **Conference Wi-Fi Drops** | (1) Have the WASM offline engine ready. (2) **Always record a crisp, 60-second 1080p video** of the perfect workflow on Day 5 to play during the pitch if the live demo fails. |
| **Audio Processing Latency** | Do not send raw audio to the Python backend. Use the browser's native Web Speech API to turn speech to text *first*, then send the tiny text string to the backend. |

---

## 5. Open-Source Reference Repositories

### Text-to-Indian Sign Language (ISL)
*   **[AI4Bharat / INCLUDE](https://github.com/AI4Bharat/INCLUDE):** Massive datasets and API foundations for ISL recognition.
*   **[Vigneshgbe / SignSync-Speech-to-Sign](https://github.com/Vigneshgbe/SignSync-Speech-to-Sign):** MediaPipe gesture tracking and NLP models mapping speech to signs.
*   **[satyam9090 / Automatic-Indian-Sign-Language-Translator](https://github.com/satyam9090/Automatic-Indian-Sign-Language-Translator):** NLP-heavy translation from English/Hindi speech to ISL gestures.

### Virtual Braille Interfaces
*   **[hallowshaw / Virtual-Braille-Keyboard](https://github.com/hallowshaw/Virtual-Braille-Keyboard):** ReactJS software interface emulating a physical Braille display with English translation.
*   **[TheZeroHz / DiptiBraille](https://github.com/TheZeroHz/DiptiBraille):** C++ based specialized Braille translator and keyboard logic.
*   **[brailletouch / Brailletouch](https://github.com/brailletouch/Brailletouch):** Hardware-centric but provides excellent logical blueprints for mapping 6-dot layouts.

---

## 6. The Pitch Delivery Note
Lead the presentation with the philosophy: **"Inclusivity is not a setting you toggle—it is an adaptive environment."** Do not focus initially on the code; focus on the side-by-side synchronization of the two different students experiencing the exact same lesson in real-time through the WebSocket architecture.
