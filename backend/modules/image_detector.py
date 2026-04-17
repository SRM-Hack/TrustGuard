"""Image deepfake detection utilities for TruthGuard."""

from __future__ import annotations

import concurrent.futures
import os
import tempfile
import time
from typing import Any

import requests
from PIL import Image

from config import HF_TOKEN


class ImageDetector:
    """Detect deepfake likelihood in images using an HF model ensemble."""

    def __init__(self) -> None:
        """Initialize model identifiers and HuggingFace inference settings."""
        self.model1 = "prithivMLmods/Deep-Fake-Detector-v2-Model"
        self.model2 = "Wvolf/ViT_Deepfake_Detection"
        self.hf_api_base = "https://api-inference.huggingface.co/models"
        self.headers = {"Authorization": f"Bearer {HF_TOKEN}"}

    def query_hf_image_model(self, model_id: str, image_bytes: bytes) -> list[dict[str, Any]]:
        """Send image bytes to a HuggingFace model and return parsed predictions.

        Retries once after 25 seconds when the endpoint returns 503.
        Returns an empty list if the request fails or output is invalid.
        """
        try:
            url = f"{self.hf_api_base}/{model_id}"
            headers = {
                **self.headers,
                "Content-Type": "application/octet-stream",
            }
            response = requests.post(url, headers=headers, data=image_bytes, timeout=60)
            if response.status_code == 503:
                time.sleep(25)
                response = requests.post(url, headers=headers, data=image_bytes, timeout=60)

            if response.status_code >= 400:
                return []

            parsed = response.json()
            return parsed if isinstance(parsed, list) else []
        except Exception:
            return []

    def extract_fake_probability(self, model_result: list[dict[str, Any]]) -> float:
        """Extract fake probability percentage from model labels and scores."""
        try:
            fake_markers = ("FAKE", "DEEPFAKE", "MANIPULATED", "LABEL_1")
            for item in model_result:
                if not isinstance(item, dict):
                    continue
                label = str(item.get("label", "")).upper()
                score = float(item.get("score", 0.0))
                if any(marker in label for marker in fake_markers):
                    return round(score * 100.0, 2)
            return 50.0
        except Exception:
            return 50.0

    def detect_deepfake(self, image_path: str) -> dict[str, Any]:
        """Run ensemble deepfake inference on an image path and return verdict."""
        try:
            with open(image_path, "rb") as image_file:
                image_bytes = image_file.read()

            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
                future1 = executor.submit(
                    self.query_hf_image_model, self.model1, image_bytes
                )
                future2 = executor.submit(
                    self.query_hf_image_model, self.model2, image_bytes
                )
                result1 = future1.result()
                result2 = future2.result()

            prob1 = self.extract_fake_probability(result1)
            prob2 = self.extract_fake_probability(result2)
            ensemble_probability = round((prob1 * 0.45) + (prob2 * 0.55), 2)

            if ensemble_probability > 60:
                verdict = "DEEPFAKE"
            elif 40 <= ensemble_probability <= 60:
                verdict = "SUSPICIOUS"
            else:
                verdict = "LIKELY_REAL"

            agree_fake = prob1 > 60 and prob2 > 60
            agree_real = prob1 < 40 and prob2 < 40
            confidence = "HIGH" if (agree_fake or agree_real) else "MEDIUM"

            return {
                "deepfake_probability": ensemble_probability,
                "model1_probability": prob1,
                "model2_probability": prob2,
                "verdict": verdict,
                "confidence": confidence,
                "ensemble_method": "weighted_average",
                "models_used": [self.model1, self.model2],
            }
        except Exception:
            return {
                "deepfake_probability": 50.0,
                "model1_probability": 50.0,
                "model2_probability": 50.0,
                "verdict": "SUSPICIOUS",
                "confidence": "MEDIUM",
                "ensemble_method": "weighted_average",
                "models_used": [self.model1, self.model2],
            }

    def analyze_image_metadata(self, image_path: str) -> dict[str, Any]:
        """Inspect image metadata and return suspicious characteristics if found."""
        try:
            suspicious_metadata: list[str] = []
            with Image.open(image_path) as image:
                image_format = image.format or "UNKNOWN"
                width, height = image.size
                mode = image.mode

                exif_data = None
                if hasattr(image, "_getexif"):
                    try:
                        exif_data = image._getexif()  # pylint: disable=protected-access
                    except Exception:
                        exif_data = None

                if width < 100 or height < 100:
                    suspicious_metadata.append(
                        "Very small resolution detected (<100 px), possible thumbnail manipulation."
                    )

                ratio = (width / height) if height else 0.0
                if ratio > 3.0 or ratio < 0.33:
                    suspicious_metadata.append(
                        "Unusually large aspect ratio detected for this image."
                    )

                # Flag JPEG only when there are signs of very heavy recompression.
                estimated_pixels = width * height
                file_size_bytes = os.path.getsize(image_path)
                if image_format.upper() == "JPEG" and estimated_pixels > 0:
                    bytes_per_pixel = file_size_bytes / estimated_pixels
                    if bytes_per_pixel < 0.05:
                        suspicious_metadata.append(
                            "Heavy JPEG re-compression detected - possible editing to hide artifacts."
                        )

                return {
                    "format": image_format,
                    "size": [width, height],
                    "mode": mode,
                    "has_exif": bool(exif_data),
                    "suspicious_metadata": suspicious_metadata,
                }
        except Exception:
            return {
                "format": "UNKNOWN",
                "size": [0, 0],
                "mode": "UNKNOWN",
                "has_exif": False,
                "suspicious_metadata": ["Failed to analyze image metadata."],
            }


if __name__ == "__main__":
    # Quick self-test: download a sample image then run ensemble detection.
    detector = ImageDetector()
    sample_url = "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=640"
    temp_path = None
    try:
        response = requests.get(sample_url, timeout=30)
        response.raise_for_status()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(response.content)
            temp_path = temp_file.name

        print("Image saved to:", temp_path)
        print(detector.detect_deepfake(temp_path))
        print(detector.analyze_image_metadata(temp_path))
    except Exception as exc:
        print("Self-test failed:", exc)
