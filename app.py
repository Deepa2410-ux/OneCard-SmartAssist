from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq

from auth import router as auth_router
from database import engine
from models import Base
from whisper_api import router as whisper_router

import asyncio

# ---------------- API KEY & MODEL ----------------
GROQ_API_KEY = "YOUR_GROQ_KEY_HERE"  # ⚠ put in env in real apps
MODEL_NAME = "llama-3.3-70b-versatile"
WHISPER_MODEL = "whisper-large-v3"

client = Groq(api_key=GROQ_API_KEY)

# ---------------- FASTAPI APP ----------------
app = FastAPI()

# create tables once at startup (optional but typical)
Base.metadata.create_all(bind=engine)

# include routers AFTER app is created
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(whisper_router, prefix="/whisper", tags=["whisper"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------- STREAM CHAT ENDPOINT (TEXT) ---------------
class Query(BaseModel):
    message: str


@app.post("/chat/stream")
async def chat_stream(req: Query):
    async def generate():
        response = client.chat.completions.create(
            model=MODEL_NAME,
            stream=True,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a polite and friendly credit-card support agent. "
                        "Speak in short and simple sentences. "
                        "Avoid long paragraphs and technical terms. "
                        "Help users calmly and clearly like a human support assistant."
                    ),
                },
                {"role": "user", "content": req.message},
            ],
        )

        for chunk in response:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                yield delta.content
                await asyncio.sleep(0.0005)

    return StreamingResponse(generate(), media_type="text/plain")


# --------------- SPEECH-TO-TEXT ENDPOINT (VOICE) ---------------
@app.post("/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)):
    audio_bytes = await file.read()

    result = client.audio.transcriptions.create(
        model=WHISPER_MODEL,
        file=("audio.wav", audio_bytes, "audio/wav"),
        response_format="json",
    )

    return {"text": result.text}
