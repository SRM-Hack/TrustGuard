"""Text misinformation and AI-generated text detection for TruthGuard."""

from __future__ import annotations

import re
import time
from typing import Any

import requests
import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer

from config import HF_TOKEN


class TextDetector:
    """Detect fake or suspicious text using HuggingFace hosted inference models."""

    def __init__(self) -> None:
        """Configure model identifiers and HuggingFace inference API metadata."""
        self.fake_news_model = "mrm8488/bert-tiny-finetuned-fake-news-detection"
        self.propaganda_model = "valurank/distilroberta-propaganda-detection"
        self.hf_api_base = "https://api-inference.huggingface.co/models"
        self.headers = {"Authorization": f"Bearer {HF_TOKEN}"}

    def query_hf_model(self, model_id: str, text: str) -> dict[str, Any] | list[Any]:
        """Query a HuggingFace inference endpoint and return parsed JSON output.

        Retries once after 20 seconds if the API responds with 503 (model loading).
        Returns an empty dict on any unrecoverable error.
        """
        url = f"{self.hf_api_base}/{model_id}"
        payload = {"inputs": text[:512]}

        try:
            response = requests.post(url, headers=self.headers, json=payload, timeout=45)

            if response.status_code == 503:
                time.sleep(20)
                response = requests.post(
                    url, headers=self.headers, json=payload, timeout=45
                )

            if response.status_code >= 400:
                return {}

            data = response.json()
            return data if isinstance(data, (dict, list)) else {}
        except Exception:
            return {}

    def classify_text(self, text: str) -> dict[str, Any]:
        """Classify text with two models and return an aggregated fake probability."""
        fake_result = self.query_hf_model(self.fake_news_model, text)
        propaganda_result = self.query_hf_model(self.propaganda_model, text)

        fake_prob_1, max_score_1 = self._extract_fake_probability(fake_result)
        fake_prob_2, max_score_2 = self._extract_fake_probability(propaganda_result)

        fake_probability = round((fake_prob_1 + fake_prob_2) / 2.0, 2)
        real_probability = round(100.0 - fake_probability, 2)

        if fake_probability > 60:
            classification = "FAKE"
        elif 40 <= fake_probability <= 60:
            classification = "SUSPICIOUS"
        else:
            classification = "REAL"

        confidence = "HIGH" if max(max_score_1, max_score_2) > 0.8 else "MEDIUM"

        return {
            "fake_probability": fake_probability,
            "real_probability": real_probability,
            "fake_news_model_raw": fake_result,
            "propaganda_model_raw": propaganda_result,
            "classification": classification,
            "confidence": confidence,
        }

    def highlight_suspicious_sentences(self, text: str) -> list[dict[str, str]]:
        """Return suspicious sentences with a concise explanation for each trigger."""
        emotion_words = [
            "BREAKING",
            "URGENT",
            "SHOCKING",
            "EXPOSED",
            "SECRET",
            "CONSPIRACY",
            "MAINSTREAM MEDIA",
            "THEY DON'T WANT YOU TO KNOW",
        ]
        exaggerated_words = ["100%", "ALL", "NEVER", "ALWAYS", "EVERYONE", "NOBODY"]

        # Simple sentence splitting based on ". ", "! ", and "? " patterns.
        normalized_text = text.replace("! ", ". ").replace("? ", ". ")
        sentences = [chunk.strip() for chunk in normalized_text.split(". ") if chunk.strip()]

        suspicious: list[dict[str, str]] = []
        for sentence in sentences:
            reason = self._suspicion_reason(sentence, emotion_words, exaggerated_words)
            if reason:
                suspicious.append({"sentence": sentence, "reason": reason})
        return suspicious

    def _extract_fake_probability(self, result: dict[str, Any] | list[Any]) -> tuple[float, float]:
        """Extract fake probability (%) and highest model confidence from HF output."""
        if isinstance(result, dict):
            if "error" in result:
                return 0.0, 0.0
            candidates = result.get("labels")
            scores = result.get("scores")
            if isinstance(candidates, list) and isinstance(scores, list):
                parsed = []
                for idx, label in enumerate(candidates):
                    score = float(scores[idx]) if idx < len(scores) else 0.0
                    parsed.append({"label": str(label), "score": score})
                return self._scan_fake_score(parsed)
            return 0.0, 0.0

        if isinstance(result, list):
            if result and isinstance(result[0], list):
                return self._scan_fake_score(result[0])
            return self._scan_fake_score(result)

        return 0.0, 0.0

    def _scan_fake_score(self, predictions: list[Any]) -> tuple[float, float]:
        """Scan prediction entries and infer fake probability from fake-like labels."""
        fake_score = 0.0
        highest_score = 0.0

        for item in predictions:
            if not isinstance(item, dict):
                continue
            label = str(item.get("label", "")).upper()
            score = float(item.get("score", 0.0))
            highest_score = max(highest_score, score)

            if "FAKE" in label or "LABEL_1" in label:
                fake_score = max(fake_score, score)

        return round(fake_score * 100.0, 2), highest_score

    def _suspicion_reason(
        self, sentence: str, emotion_words: list[str], exaggerated_words: list[str]
    ) -> str | None:
        """Return a reason if sentence matches any suspicious language pattern."""
        words = re.findall(r"\b[\w']+\b", sentence)
        upper_words = [word for word in words if word.isupper() and len(word) > 1]
        caps_ratio = (len(upper_words) / len(words)) if words else 0.0

        sentence_upper = sentence.upper()
        if caps_ratio > 0.3:
            return "Excessive capitalization suggests sensational framing"
        if any(word in sentence_upper for word in emotion_words):
            return "Contains emotionally charged language"
        if any(word in sentence_upper for word in exaggerated_words):
            return "Contains exaggerated absolute claims"
        return None


class AITextDetector:
    """Estimate likelihood of AI-generated text using GPT-2 perplexity."""

    def __init__(self) -> None:
        """Initialize lazy-load placeholders for GPT-2 model and tokenizer."""
        self._model: GPT2LMHeadModel | None = None
        self._tokenizer: GPT2Tokenizer | None = None

    def _ensure_loaded(self) -> None:
        """Load GPT-2 model and tokenizer on first use and cache them."""
        if self._model is None or self._tokenizer is None:
            self._tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
            self._model = GPT2LMHeadModel.from_pretrained("gpt2")
            self._model.eval()

    def compute_perplexity(self, text: str) -> float:
        """Compute GPT-2 perplexity for given text; return 100.0 on failure."""
        try:
            self._ensure_loaded()
            assert self._tokenizer is not None
            assert self._model is not None

            inputs = self._tokenizer(
                text, return_tensors="pt", truncation=True, max_length=512
            )
            with torch.no_grad():
                outputs = self._model(**inputs, labels=inputs["input_ids"])
                loss = outputs.loss
            return float(torch.exp(loss).item())
        except Exception:
            return 100.0

    def is_ai_generated(self, text: str) -> dict[str, Any]:
        """Return AI-generation probability and interpretation from perplexity."""
        perplexity = self.compute_perplexity(text)
        ai_probability = max(0.0, min(((30.0 - perplexity) / 30.0) * 100.0, 100.0))
        ai_probability = round(ai_probability, 2)

        if ai_probability > 65:
            interpretation = (
                "The text is highly smooth and predictable, which aligns with "
                "common AI-generated writing patterns."
            )
        elif ai_probability > 35:
            interpretation = (
                "The text shows partial AI-like fluency, but evidence is mixed."
            )
        else:
            interpretation = (
                "The text appears varied and less predictable, which is generally "
                "more consistent with human-authored writing."
            )

        return {
            "ai_probability": ai_probability,
            "perplexity": round(perplexity, 4),
            "likely_ai_generated": ai_probability > 65,
            "interpretation": interpretation,
        }


if __name__ == "__main__":
    # Quick self-test
    det = TextDetector()
    ai_det = AITextDetector()
    sample = "BREAKING: Government secretly planning to shut down internet across India!"
    print(det.classify_text(sample))
    print(ai_det.is_ai_generated(sample))
