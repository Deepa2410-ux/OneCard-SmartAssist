OneCard-SmartAssist
OneCard SmartAssist is a GenAI‑powered credit card assistant (React + FastAPI) that lets users manage their OneCard via chat and voice—check balance, view transactions, download statements, pay bills via QR/UPI, and track or block the card.​

Features
Chat + voice interface with a virtual credit‑card agent.

Account overview: limit, used/available credit, current bill.

Recent transactions and PDF statement download.

Bill payment via UPI QR code and simple confirmation flow.

Spending analytics dashboard and card controls (track / block with multi‑step reason capture).

Text‑to‑speech for replies and optional speech‑to‑text via FastAPI /speech-to-text + Whisper.​

Tech Stack & Run
Frontend: React, React Router, react-qr-code, @react-pdf/renderer.​

Backend: FastAPI, Groq/OpenAI (LLM + Whisper), CORS middleware.​

Data: Demo user/profile stored in localStorage + sessionStorage.

Run locally:
