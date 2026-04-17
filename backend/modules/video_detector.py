"""Video deepfake analysis by combining frame and audio signals."""

from __future__ import annotations

import concurrent.futures
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any

import cv2

from modules.audio_detector import AudioDetector
from modules.image_detector import ImageDetector


class VideoDetector:
    """Analyze videos using frame-level image checks and audio deepfake checks."""

    def __init__(self) -> None:
        """Initialize child detectors and frame sampling settings."""
        self.image_det = ImageDetector()
        self.audio_det = AudioDetector()
        self.max_frames = 10

    def extract_frames(self, video_path: str, fps: int = 1) -> list[str]:
        """Extract sampled frames into temporary image files.

        Args:
            video_path: Path to input video.
            fps: Target frame samples per second.

        Returns:
            List of extracted frame file paths.
        """
        frame_paths: list[str] = []
        cap = None
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return []

            native_fps = cap.get(cv2.CAP_PROP_FPS)
            if not native_fps or native_fps <= 0:
                native_fps = 30.0

            frame_skip = int(native_fps / fps) if fps > 0 else int(native_fps)
            frame_skip = max(frame_skip, 1)

            frame_index = 0
            while len(frame_paths) < self.max_frames:
                success, frame = cap.read()
                if not success:
                    break

                if frame_index % frame_skip == 0:
                    temp_path = tempfile.mktemp(suffix=".jpg")
                    cv2.imwrite(temp_path, frame)
                    frame_paths.append(temp_path)
                frame_index += 1

            return frame_paths
        except Exception:
            return frame_paths
        finally:
            if cap is not None:
                cap.release()

    def extract_audio_track(self, video_path: str) -> str | None:
        """Extract video audio track using ffmpeg.

        Returns output path when successful, otherwise None.
        """
        try:
            output_path = str(Path(video_path).with_suffix("")) + "_audio.wav"
            command = [
                "ffmpeg",
                "-i",
                video_path,
                "-q:a",
                "0",
                "-map",
                "a",
                output_path,
                "-y",
            ]
            completed = subprocess.run(
                command,
                check=False,
                capture_output=True,
                text=True,
            )
            if completed.returncode != 0 or not os.path.exists(output_path):
                return None
            return output_path
        except Exception:
            return None

    def analyze_frames(self, frame_paths: list[str]) -> dict[str, Any]:
        """Run image deepfake detection on extracted frames and aggregate metrics."""
        try:
            frame_results: list[dict[str, float]] = []
            probabilities: list[float] = []

            for frame_path in frame_paths:
                result = self.image_det.detect_deepfake(frame_path)
                probability = float(result.get("deepfake_probability", 50.0))
                probabilities.append(probability)
                frame_results.append({"deepfake_probability": probability})

            if not probabilities:
                return {
                    "frames_analyzed": 0,
                    "avg_deepfake_probability": 0.0,
                    "max_frame_probability": 0.0,
                    "min_frame_probability": 0.0,
                    "suspicious_frame_count": 0,
                    "frame_results": [],
                }

            avg_probability = round(sum(probabilities) / len(probabilities), 2)
            max_probability = round(max(probabilities), 2)
            min_probability = round(min(probabilities), 2)
            suspicious_frame_count = sum(1 for value in probabilities if value > 60)

            return {
                "frames_analyzed": len(frame_paths),
                "avg_deepfake_probability": avg_probability,
                "max_frame_probability": max_probability,
                "min_frame_probability": min_probability,
                "suspicious_frame_count": suspicious_frame_count,
                "frame_results": frame_results,
            }
        except Exception:
            return {
                "frames_analyzed": 0,
                "avg_deepfake_probability": 0.0,
                "max_frame_probability": 0.0,
                "min_frame_probability": 0.0,
                "suspicious_frame_count": 0,
                "frame_results": [],
            }

    def analyze(self, video_path: str) -> dict[str, Any]:
        """Analyze a video by combining frame and audio deepfake evidence."""
        frame_paths: list[str] = []
        audio_path: str | None = None
        try:
            frame_paths = self.extract_frames(video_path)
            audio_path = self.extract_audio_track(video_path)
            audio_det_analyze = lambda p: self.audio_det.analyze(p)
            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
                future_frames = executor.submit(self.analyze_frames, frame_paths)
                future_audio = (
                    executor.submit(audio_det_analyze, audio_path) if audio_path else None
                )

                frame_analysis = future_frames.result()
                audio_analysis = future_audio.result() if future_audio else None
            avg_frame_prob = float(frame_analysis.get("avg_deepfake_probability", 0.0))
            if audio_analysis is not None:
                audio_voice_clone_score = float(
                    audio_analysis.get("voice_clone_score", 50.0)
                )
                video_deepfake_score = round(
                    (avg_frame_prob * 0.6) + (audio_voice_clone_score * 0.4), 2
                )
            else:
                video_deepfake_score = round(avg_frame_prob, 2)

            if video_deepfake_score > 60:
                verdict = "MANIPULATED"
            elif 40 <= video_deepfake_score <= 60:
                verdict = "SUSPICIOUS"
            else:
                verdict = "LIKELY_AUTHENTIC"

            if audio_analysis is not None:
                processing_note = (
                    f"Analyzed {frame_analysis.get('frames_analyzed', 0)} frames + audio"
                )
            else:
                processing_note = (
                    f"Analyzed {frame_analysis.get('frames_analyzed', 0)} frames only"
                )

            return {
                "video_deepfake_score": video_deepfake_score,
                "verdict": verdict,
                "frame_analysis": frame_analysis,
                "audio_analysis": audio_analysis,
                "processing_note": processing_note,
            }
        except Exception:
            return {
                "video_deepfake_score": 0.0,
                "verdict": "SUSPICIOUS",
                "frame_analysis": {
                    "frames_analyzed": 0,
                    "avg_deepfake_probability": 0.0,
                    "max_frame_probability": 0.0,
                    "min_frame_probability": 0.0,
                    "suspicious_frame_count": 0,
                    "frame_results": [],
                },
                "audio_analysis": None,
                "processing_note": "Video analysis failed",
            }
        finally:
            for frame_path in frame_paths:
                try:
                    if frame_path and os.path.exists(frame_path):
                        os.unlink(frame_path)
                except Exception:
                    pass
            try:
                if audio_path and os.path.exists(audio_path):
                    os.unlink(audio_path)
            except Exception:
                pass
