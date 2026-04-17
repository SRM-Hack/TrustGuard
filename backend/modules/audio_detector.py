"""Audio transcription and voice-clone detection for TruthGuard."""

from __future__ import annotations

import concurrent.futures
import subprocess
import time
from pathlib import Path
from typing import Any

import librosa
import numpy as np
import requests
import whisper

from config import HF_TOKEN


class AudioDetector:
    """Analyze audio with Whisper transcription and deepfake voice detection."""

    _whisper_model: Any = None

    def __init__(self) -> None:
        """Initialize lazy model handles and HF endpoint configuration."""
        self._whisper_model = None
        self.hf_token = HF_TOKEN
        self.voice_clone_model = "mo-thecreator/Deepfake-audio-detection"
        self.hf_headers = {"Authorization": f"Bearer {self.hf_token}"}

    def _ensure_whisper(self) -> None:
        """Load Whisper model on first use and cache it for subsequent calls."""
        if AudioDetector._whisper_model is None:
            print("Loading Whisper model... (this takes ~30s on first run)")
            AudioDetector._whisper_model = whisper.load_model("small")
        self._whisper_model = AudioDetector._whisper_model

    def transcribe(self, audio_path: str) -> tuple[str, str]:
        """Transcribe audio and return transcript with detected language code."""
        try:
            self._ensure_whisper()
            if self._whisper_model is None:
                return "Transcription failed", "en"

            result = self._whisper_model.transcribe(audio_path)
            transcript = str(result.get("text", "")).strip()
            language = str(result.get("language", "en")).strip().lower()

            if language not in ["en", "hi", "te", "ta"]:
                return "", "en"
            return transcript, language
        except Exception:
            return "Transcription failed", "en"

    def detect_voice_clone(self, audio_path: str) -> dict[str, Any]:
        """Run HF deepfake-audio detection and return probability + verdict."""
        try:
            with open(audio_path, "rb") as audio_file:
                audio_bytes = audio_file.read()

            headers = {**self.hf_headers, "Content-Type": "application/octet-stream"}
            url = f"https://api-inference.huggingface.co/models/{self.voice_clone_model}"
            response = requests.post(url, headers=headers, data=audio_bytes, timeout=60)

            if response.status_code == 503:
                time.sleep(25)
                response = requests.post(
                    url, headers=headers, data=audio_bytes, timeout=60
                )

            if response.status_code >= 400:
                return {
                    "voice_clone_probability": 50.0,
                    "verdict": "SUSPICIOUS",
                    "raw_model_result": [],
                }

            result = response.json()
            if not isinstance(result, list):
                result = []

            probability = 50.0
            markers = ("FAKE", "SPOOF", "LABEL_1", "DEEPFAKE")
            for item in result:
                if not isinstance(item, dict):
                    continue
                label = str(item.get("label", "")).upper()
                score = float(item.get("score", 0.0))
                if any(marker in label for marker in markers):
                    probability = round(score * 100.0, 2)
                    break

            if probability > 60:
                verdict = "CLONED"
            elif 40 <= probability <= 60:
                verdict = "SUSPICIOUS"
            else:
                verdict = "LIKELY_REAL"

            return {
                "voice_clone_probability": probability,
                "verdict": verdict,
                "raw_model_result": result,
            }
        except Exception:
            return {
                "voice_clone_probability": 50.0,
                "verdict": "SUSPICIOUS",
                "raw_model_result": [],
            }

    def extract_spectral_features(self, audio_path: str) -> dict[str, float]:
        """Extract summary spectral features from audio using librosa."""
        try:
            signal, sr = librosa.load(audio_path, sr=16000)
            duration_seconds = float(librosa.get_duration(y=signal, sr=sr))

            mfcc = librosa.feature.mfcc(y=signal, sr=sr, n_mfcc=13)
            spectral_centroid = librosa.feature.spectral_centroid(y=signal, sr=sr)
            zero_crossing_rate = librosa.feature.zero_crossing_rate(y=signal)
            rms_energy = librosa.feature.rms(y=signal)

            return {
                "mfcc_mean": float(np.mean(mfcc)),
                "spectral_centroid_mean": float(np.mean(spectral_centroid)),
                "zero_crossing_rate_mean": float(np.mean(zero_crossing_rate)),
                "rms_energy_mean": float(np.mean(rms_energy)),
                "duration_seconds": duration_seconds,
            }
        except Exception:
            return {}

    def preprocess_audio(self, audio_path: str) -> str:
        """Convert audio input to 16kHz mono WAV with ffmpeg."""
        try:
            source_path = Path(audio_path)
            output_path = str(source_path.with_name(f"{source_path.stem}_processed.wav"))
            command = [
                "ffmpeg",
                "-i",
                audio_path,
                "-ar",
                "16000",
                "-ac",
                "1",
                "-y",
                output_path,
            ]
            completed = subprocess.run(
                command,
                check=False,
                capture_output=True,
                text=True,
            )
            if completed.returncode != 0:
                return audio_path
            return output_path
        except Exception:
            return audio_path

    def analyze(self, audio_path: str) -> dict[str, Any]:
        """Run end-to-end audio analysis pipeline in parallel where possible."""
        processed_path = self.preprocess_audio(audio_path)
        processing_note = (
            "Audio preprocessed to 16kHz mono WAV"
            if processed_path != audio_path
            else "Using original audio file (preprocessing skipped or failed)"
        )

        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                future_transcribe = executor.submit(self.transcribe, processed_path)
                future_clone = executor.submit(self.detect_voice_clone, processed_path)
                future_spectral = executor.submit(
                    self.extract_spectral_features, processed_path
                )

                transcript, detected_language = future_transcribe.result()
                clone_result = future_clone.result()
                spectral_features = future_spectral.result()

            return {
                "transcript": transcript,
                "detected_language": detected_language,
                "voice_clone_score": float(
                    clone_result.get("voice_clone_probability", 50.0)
                ),
                "voice_clone_verdict": str(clone_result.get("verdict", "SUSPICIOUS")),
                "spectral_features": spectral_features,
                "voice_clone_raw": clone_result,
                "processing_note": processing_note,
            }
        except Exception:
            return {
                "transcript": "Transcription failed",
                "detected_language": "en",
                "voice_clone_score": 50.0,
                "voice_clone_verdict": "SUSPICIOUS",
                "spectral_features": {},
                "voice_clone_raw": {
                    "voice_clone_probability": 50.0,
                    "verdict": "SUSPICIOUS",
                    "raw_model_result": [],
                },
                "processing_note": processing_note,
            }
        finally:
            # Clean up the preprocessed file if it's different from the original.
            if processed_path != audio_path:
                try:
                    import os

                    if os.path.exists(processed_path):
                        os.unlink(processed_path)
                except Exception:
                    pass
