from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import openai
import os

router = APIRouter()

# Load key from .env
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY


@router.post("/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()

        # Whisper V1 API call
        transcript = openai.chat.completions.create(
            model="gpt-4o-mini-tts",  # Whisper model replaced under new API routing
            messages=[
                {"role": "system", "content": "Transcribe this audio to text."},
            ],
            input=audio_bytes
        )

        text = transcript.choices[0].message["content"]
        return JSONResponse({"text": text})
    except Exception as e:
        print("Whisper Error =>", str(e))
        return JSONResponse({"text": "", "error": str(e)}, status_code=500)
