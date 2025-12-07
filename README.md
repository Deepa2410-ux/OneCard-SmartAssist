![Screenshot_7-12-2025_224954_localhost](https://github.com/user-attachments/assets/1f581fe7-ad18-479d-b608-93d10ca69eb9)# OneCard SmartAssist

OneCard SmartAssist is a GenAI‑powered credit card assistant (React + FastAPI) that lets users manage their OneCard via chat and voice — check balance, view transactions, download statements, pay bills via QR/UPI, and track or block the card.
---
demo video link:-https://drive.google.com/drive/folders/16NH6icAv-hCsxNHZdBbyCoUpEUzCfV9l
## Features

- **Chat + voice interface** with a virtual credit‑card agent  
- **Account overview**: credit limit, used amount, available credit, and current bill  
- **Recent transactions** list with merchant, date, and amount  
- **PDF statement download** generated from mock data  
- **Bill payment via UPI QR** and simple confirmation flow  
- **Spending analytics dashboard** for category‑wise spends  
- **Card controls**: track card delivery, block card with reason + confirmation  
- **Text‑to‑speech (TTS)** for bot replies  
- **Optional speech‑to‑text (STT)** via `/speech-to-text` + Whisper model  

---

## Architecture (High Level)

- **React frontend**
  - Screens: Register, Login, Chatbot, Dashboard
  - Components: `Chatbot`, `Dashboard`, `StatementPDF`
  - Handles quick intents on the client (balance, bill, transactions, block, etc.)
  - Sends API requests for LLM chat and speech‑to‑text

- **FastAPI backend**
  - REST endpoints for auth, chatbot streaming, and STT
  - Calls Llama‑based / OpenAI‑compatible LLMs for open‑ended queries
  - Calls Whisper‑style STT for voice input
  - Reads mock data and knowledge‑base text files for OneCard‑specific answers

- **Data & knowledge**
  - Demo user, card, bill, and transactions stored in local DB / mock data
  - Simple text files for FAQs: onboarding, delivery, EMI, payments, statements

---

## Tech Stack

**Frontend**

- React (SPA)
- React Router
- `react-qr-code` for UPI QR
- `@react-pdf/renderer` for PDF statement
- Browser Web Speech API for TTS

**Backend**

- FastAPI
- Llama / OpenAI‑compatible LLM API (chat)
- Whisper‑style STT API
- CORS middleware
- SQLite / mock DB + text knowledge‑base

---

## Getting Started

### 1. Clone the repo

git clone https://github.com/Deepa2410-ux/OneCard-SmartAssist.git
cd OneCard-SmartAssist

### 2. Backend setup
cd backend
python -m venv venv
venv\Scripts\activate # Windows
pip install -r requirements.txt

Create a `.env` file in `backend/`:
OPENAI_API_KEY=your_llm_or_groq_key
WHISPER_API_KEY=your_whisper_key # or same key if shared

Run FastAPI:
uvicorn app:app --reload

Backend will be available at `http://localhost:8000`.

### 3. Frontend setup
cd ../frontend
npm install
npm start

Frontend will be available at `http://localhost:3000`.

---

## Demo Flow

1. **Register** with demo details (name, phone, email, UPI PIN, last 4 digits).  
2. **Login** using phone number and PIN.  
3. Use quick‑action buttons:
   - *Check Balance*
   - *Recent Transactions*
   - *Download Statement*
   - *Spending Analytics*
   - *Track Card*
   - *Block Card*
   - *Pay Bill*
4. Click the **mic** icon to speak; the app:
   - Records your voice
   - Sends audio to `/speech-to-text`
   - Uses the transcribed text in the same chat flow

---

## ‘AI Co‑Pilot’ Usage

- **Llama / OpenAI‑compatible LLMs** power natural chat responses and fallback answers.  
- **Whisper‑style STT** converts microphone audio to text for voice chat.  
- **Perplexity AI** was used during development for researching issues, refining architecture, and drafting documentation/content, with all final design and code decisions reviewed manually.

---

## Roadmap

- Real backend integration with live OneCard APIs  
- Multi‑language support (English + Indian languages)  
- Richer analytics and personalized insights  
- Dispute / support ticket flows from within the chat

---




