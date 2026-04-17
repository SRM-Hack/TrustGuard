"""TruthGuard FastAPI entry point."""

from __future__ import annotations

import json
import logging
import os
import tempfile
import time
from typing import Any

import uvicorn
from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from modules.audio_detector import AudioDetector
from modules.countermeasure import CountermeasureEngine
from modules.fact_verifier import FactVerifier
from modules.image_detector import ImageDetector
from modules.text_detector import AITextDetector, TextDetector
from modules.video_detector import VideoDetector
from utils.language import detect_language
from utils.scorer import TrustScorer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("truthguard")

app = FastAPI(
    title="TruthGuard API",
    version="1.0.0",
    description="Multimodal Misinformation Detection Platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("=== TruthGuard API Starting ===")

module_status: dict[str, bool] = {
    "text": False,
    "ai_text": False,
    "image": False,
    "audio": False,
    "video": False,
    "fact_check": False,
    "countermeasure": False,
    "scorer": False,
}

text_det: TextDetector | None = None
ai_text_det: AITextDetector | None = None
image_det: ImageDetector | None = None
audio_det: AudioDetector | None = None
video_det: VideoDetector | None = None
fact_ver: FactVerifier | None = None
counter: CountermeasureEngine | None = None
scorer: TrustScorer | None = None

try:
    text_det = TextDetector()
    module_status["text"] = True
except Exception as exc:
    logger.exception("Failed to initialize TextDetector: %s", exc)

try:
    ai_text_det = AITextDetector()
    module_status["ai_text"] = True
except Exception as exc:
    logger.exception("Failed to initialize AITextDetector: %s", exc)

try:
    image_det = ImageDetector()
    module_status["image"] = True
except Exception as exc:
    logger.exception("Failed to initialize ImageDetector: %s", exc)

try:
    audio_det = AudioDetector()
    module_status["audio"] = True
except Exception as exc:
    logger.exception("Failed to initialize AudioDetector: %s", exc)

try:
    video_det = VideoDetector()
    module_status["video"] = True
except Exception as exc:
    logger.exception("Failed to initialize VideoDetector: %s", exc)

try:
    fact_ver = FactVerifier()
    module_status["fact_check"] = True
except Exception as exc:
    logger.exception("Failed to initialize FactVerifier: %s", exc)

try:
    counter = CountermeasureEngine()
    module_status["countermeasure"] = True
except Exception as exc:
    logger.exception("Failed to initialize CountermeasureEngine: %s", exc)

try:
    scorer = TrustScorer()
    module_status["scorer"] = True
except Exception as exc:
    logger.exception("Failed to initialize TrustScorer: %s", exc)


@app.get("/")
def root() -> dict[str, Any]:
    """Root endpoint indicating API availability and enabled modules."""
    return {
        "status": "online",
        "version": "1.0.0",
        "modules": ["text", "image", "audio", "video", "fact_check", "countermeasure"],
    }


@app.get("/health")
def health() -> dict[str, Any]:
    """Health endpoint showing initialization status for each module."""
    return {"status": "healthy", "modules_status": module_status}


@app.post("/analyze/text")
async def analyze_text(
    background_tasks: BackgroundTasks,
    text: str = Form(...),
    language: str = Form("auto"),
) -> dict[str, Any]:
    """Analyze text for misinformation, AI-generation, and fact-check evidence."""
    _ = background_tasks
    started = time.time()
    try:
        if not text_det or not ai_text_det or not fact_ver or not scorer or not counter:
            raise HTTPException(status_code=500, detail="Required text modules are unavailable.")

        # Auto-detect language unless explicitly provided by caller.
        if language == "auto":
            language = detect_language(text)

        # Run core text detection tasks.
        fake_result = text_det.classify_text(text)
        ai_result = ai_text_det.is_ai_generated(text)
        highlighted = text_det.highlight_suspicious_sentences(text)
        fact_results = fact_ver.verify_claims(text)

        all_results = {
            "text": {**fake_result, **ai_result},
            "fact_check": fact_results,
        }
        trust = scorer.calculate_trust_score(all_results)
        counter_response = counter.generate_full_response(
            text, all_results, fact_results, trust, language
        )
        logger.debug("Text detection snapshot: %s", json.dumps(all_results)[:300])

        processing_time_ms = int((time.time() - started) * 1000)
        logger.info("Text analysis completed in %sms", processing_time_ms)

        return {
            "trust_score": trust,
            "detection": all_results,
            "suspicious_sentences": highlighted,
            "countermeasure": counter_response,
            "language_detected": language,
            "processing_time_ms": processing_time_ms,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Text analysis failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/analyze/image")
async def analyze_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
) -> dict[str, Any]:
    """Analyze uploaded image for deepfake signs and metadata anomalies."""
    _ = background_tasks
    started = time.time()
    temp_path: str | None = None
    try:
        if not image_det or not scorer or not counter:
            raise HTTPException(status_code=500, detail="Required image modules are unavailable.")

        extension = os.path.splitext(file.filename or "")[1] or ".jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as tmp:
            temp_path = tmp.name
            tmp.write(await file.read())

        deepfake_result = image_det.detect_deepfake(temp_path)
        metadata_result = image_det.analyze_image_metadata(temp_path)
        all_results = {"image": deepfake_result}
        trust = scorer.calculate_trust_score(all_results)
        counter_response = counter.generate_full_response(
            "Image content analysis", all_results, [], trust, "en"
        )

        processing_time_ms = int((time.time() - started) * 1000)
        logger.info("Image analysis completed in %sms", processing_time_ms)

        return {
            "trust_score": trust,
            "detection": all_results,
            "metadata_analysis": metadata_result,
            "countermeasure": counter_response,
            "processing_time_ms": processing_time_ms,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Image analysis failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except Exception:
                logger.warning("Failed to delete temp image file: %s", temp_path)


@app.post("/analyze/audio")
async def analyze_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
) -> dict[str, Any]:
    """Analyze uploaded audio for transcription, cloning, and claim verification."""
    _ = background_tasks
    started = time.time()
    temp_path: str | None = None
    try:
        if not audio_det or not fact_ver or not scorer or not counter:
            raise HTTPException(status_code=500, detail="Required audio modules are unavailable.")

        extension = os.path.splitext(file.filename or "")[1].lower()
        if extension not in {".wav", ".mp3", ".m4a"}:
            raise HTTPException(status_code=400, detail="Unsupported audio format.")

        with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as tmp:
            temp_path = tmp.name
            tmp.write(await file.read())

        audio_result = audio_det.analyze(temp_path)
        transcript = str(audio_result.get("transcript", "") or "")
        fact_results = fact_ver.verify_claims(transcript) if len(transcript) > 50 else []

        all_results = {"audio": audio_result, "fact_check": fact_results}
        trust = scorer.calculate_trust_score(all_results)
        language = detect_language(transcript) if transcript else "en"
        counter_response = counter.generate_full_response(
            transcript or "Audio analysis", all_results, fact_results, trust, language
        )

        processing_time_ms = int((time.time() - started) * 1000)
        logger.info("Audio analysis completed in %sms", processing_time_ms)

        return {
            "trust_score": trust,
            "detection": all_results,
            "countermeasure": counter_response,
            "language_detected": language,
            "processing_time_ms": processing_time_ms,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Audio analysis failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except Exception:
                logger.warning("Failed to delete temp audio file: %s", temp_path)


@app.post("/analyze/video")
async def analyze_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
) -> dict[str, Any]:
    """Analyze uploaded video using frame and audio deepfake pipelines."""
    _ = background_tasks
    started = time.time()
    temp_path: str | None = None
    try:
        if not video_det or not fact_ver or not scorer or not counter:
            raise HTTPException(status_code=500, detail="Required video modules are unavailable.")

        extension = os.path.splitext(file.filename or "")[1].lower()
        if extension not in {".mp4", ".mov", ".avi"}:
            raise HTTPException(status_code=400, detail="Unsupported video format.")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            temp_path = tmp.name
            tmp.write(await file.read())

        video_result = video_det.analyze(temp_path)
        audio_analysis = video_result.get("audio_analysis") if isinstance(video_result, dict) else None
        transcript = ""
        if isinstance(audio_analysis, dict):
            transcript = str(audio_analysis.get("transcript", "") or "")
        fact_results = fact_ver.verify_claims(transcript) if len(transcript) > 50 else []

        all_results = {"video": video_result, "fact_check": fact_results}
        trust = scorer.calculate_trust_score(all_results)
        counter_response = counter.generate_full_response(
            transcript or "Video analysis", all_results, fact_results, trust, "en"
        )

        processing_time_ms = int((time.time() - started) * 1000)
        logger.info("Video analysis completed in %sms", processing_time_ms)

        return {
            "trust_score": trust,
            "detection": all_results,
            "countermeasure": counter_response,
            "processing_time_ms": processing_time_ms,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Video analysis failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except Exception:
                logger.warning("Failed to delete temp video file: %s", temp_path)


@app.exception_handler(Exception)
async def global_exception_handler(_, exc: Exception) -> JSONResponse:
    """Catch-all exception handler that returns normalized 500 responses."""
    logger.exception("Unhandled server exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
