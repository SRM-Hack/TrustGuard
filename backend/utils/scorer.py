"""Trust score aggregation utility for TruthGuard."""

from __future__ import annotations

from typing import Any


class TrustScorer:
    """Aggregate module outputs into a unified trust score and verdict."""

    FALSE_KEYWORDS = {"false", "fake", "wrong", "misleading", "incorrect"}

    def calculate_trust_score(self, results: dict[str, Any]) -> dict[str, Any]:
        """Calculate trust score, verdict, flags, and scoring breakdown.

        The score starts at 100 and deducts points based on module outputs.
        Returns a normalized payload suitable for API and UI consumption.
        """
        score = 100
        flags: list[str] = []
        modalities_analyzed: list[str] = []
        score_breakdown: dict[str, list[dict[str, Any]]] = {
            "deductions": [],
            "starting_score": 100,
        }

        text = results.get("text")
        if isinstance(text, dict):
            modalities_analyzed.append("text")

            fake_probability = self._to_number(text.get("fake_probability"))
            if fake_probability > 60:
                score -= 30
                self._add_deduction(
                    score_breakdown,
                    "text.fake_probability",
                    30,
                    fake_probability,
                    "High fake news probability detected in text content",
                )
                flags.append("High fake news probability detected in text content")
            elif 40 <= fake_probability <= 60:
                score -= 15
                self._add_deduction(
                    score_breakdown,
                    "text.fake_probability",
                    15,
                    fake_probability,
                    "Text content has suspicious patterns",
                )
                flags.append("Text content has suspicious patterns")

            ai_probability = self._to_number(text.get("ai_probability"))
            if ai_probability > 70:
                score -= 20
                self._add_deduction(
                    score_breakdown,
                    "text.ai_probability",
                    20,
                    ai_probability,
                    "Content appears to be AI-generated",
                )
                flags.append("Content appears to be AI-generated")
            elif 50 <= ai_probability <= 70:
                score -= 10
                self._add_deduction(
                    score_breakdown,
                    "text.ai_probability",
                    10,
                    ai_probability,
                    "Content may be partially AI-generated",
                )
                flags.append("Content may be partially AI-generated")

        image = results.get("image")
        if isinstance(image, dict):
            modalities_analyzed.append("image")

            deepfake_probability = self._to_number(image.get("deepfake_probability"))
            if deepfake_probability > 60:
                score -= 35
                self._add_deduction(
                    score_breakdown,
                    "image.deepfake_probability",
                    35,
                    deepfake_probability,
                    "Image shows strong signs of deepfake manipulation",
                )
                flags.append("Image shows strong signs of deepfake manipulation")
            elif 40 <= deepfake_probability <= 60:
                score -= 18
                self._add_deduction(
                    score_breakdown,
                    "image.deepfake_probability",
                    18,
                    deepfake_probability,
                    "Image has possible manipulation artifacts",
                )
                flags.append("Image has possible manipulation artifacts")

        audio = results.get("audio")
        if isinstance(audio, dict):
            modalities_analyzed.append("audio")

            voice_clone_score = self._to_number(audio.get("voice_clone_score"))
            if voice_clone_score > 60:
                score -= 30
                self._add_deduction(
                    score_breakdown,
                    "audio.voice_clone_score",
                    30,
                    voice_clone_score,
                    "Voice audio may be AI-cloned or synthesized",
                )
                flags.append("Voice audio may be AI-cloned or synthesized")

        video = results.get("video")
        if isinstance(video, dict):
            modalities_analyzed.append("video")

            video_deepfake_score = self._to_number(video.get("video_deepfake_score"))
            if video_deepfake_score > 60:
                score -= 32
                self._add_deduction(
                    score_breakdown,
                    "video.video_deepfake_score",
                    32,
                    video_deepfake_score,
                    "Video frames show deepfake indicators",
                )
                flags.append("Video frames show deepfake indicators")

        fact_check = results.get("fact_check")
        if isinstance(fact_check, list):
            modalities_analyzed.append("fact_check")
            for claim_entry in fact_check:
                if not isinstance(claim_entry, dict):
                    continue

                claim_text = str(
                    claim_entry.get("claim")
                    or claim_entry.get("text")
                    or claim_entry.get("query")
                    or "Unspecified claim"
                )
                claim_results = claim_entry.get("fact_check_results", [])
                if not isinstance(claim_results, list):
                    continue

                if self._claim_is_false_like(claim_results):
                    score -= 25
                    trimmed_claim = (
                        claim_text[:100] + "..." if len(claim_text) > 100 else claim_text
                    )
                    claim_flag = f"Fact-check warning: {trimmed_claim}"
                    flags.append(claim_flag)
                    self._add_deduction(
                        score_breakdown,
                        "fact_check.rating",
                        25,
                        "false-like rating",
                        claim_flag,
                    )

        trust_score = max(0, min(100, int(round(score))))
        verdict, verdict_color, verdict_emoji = self._verdict_fields(trust_score)

        score_breakdown["final_score"] = trust_score
        score_breakdown["severity"] = self.get_severity_label(trust_score)

        return {
            "trust_score": trust_score,
            "verdict": verdict,
            "verdict_color": verdict_color,
            "verdict_emoji": verdict_emoji,
            "flags": flags,
            "score_breakdown": score_breakdown,
            "modalities_analyzed": modalities_analyzed,
        }

    def get_severity_label(self, score: int) -> str:
        """Map trust score to a human-readable risk label."""
        if score >= 80:
            return "Low Risk"
        if score >= 60:
            return "Medium Risk"
        if score >= 40:
            return "High Risk"
        return "Critical Risk"

    def _claim_is_false_like(self, claim_results: list[Any]) -> bool:
        """Return True if any rating suggests false or misleading content."""
        for result in claim_results:
            rating = ""
            if isinstance(result, dict):
                rating = str(result.get("rating", ""))
            normalized = rating.strip().lower()
            if any(keyword in normalized for keyword in self.FALSE_KEYWORDS):
                return True
        return False

    def _verdict_fields(self, score: int) -> tuple[str, str, str]:
        """Compute verdict label, color, and emoji from trust score."""
        if score >= 70:
            return "TRUSTED", "green", "✅"
        if score >= 40:
            return "SUSPICIOUS", "orange", "⚠️"
        return "MISINFORMATION", "red", "🚨"

    def _to_number(self, value: Any) -> float:
        """Safely coerce a value to float; defaults to 0.0 on invalid data."""
        try:
            return float(value)
        except (TypeError, ValueError):
            return 0.0

    def _add_deduction(
        self,
        score_breakdown: dict[str, Any],
        source: str,
        points: int,
        observed_value: Any,
        reason: str,
    ) -> None:
        """Append deduction details to score breakdown for UI visibility."""
        score_breakdown["deductions"].append(
            {
                "source": source,
                "points": points,
                "observed_value": observed_value,
                "reason": reason,
            }
        )
