"""Countermeasure engine for explanations, corrections, and source alternatives."""

from __future__ import annotations

import json
from typing import Any

import google.generativeai as genai
import requests
from groq import Groq

from config import GEMINI_API_KEY, GROQ_API_KEY, NEWS_API_KEY


class CountermeasureEngine:
    """Generate active trust-building responses for suspicious content."""

    def __init__(self) -> None:
        """Initialize LLM clients, API keys, and language metadata."""
        genai.configure(api_key=GEMINI_API_KEY)
        self.gemini_model = genai.GenerativeModel("gemini-2.0-flash-exp")
        self.groq_client = Groq(api_key=GROQ_API_KEY)
        self.news_api_key = NEWS_API_KEY
        self.language_names = {"en": "English", "hi": "Hindi", "te": "Telugu"}
        self._last_llm_provider = "gemini"

    def _call_gemini(self, prompt: str) -> str:
        """Call Gemini and return text response or raise on failure."""
        try:
            response = self.gemini_model.generate_content(prompt)
            text = (response.text or "").strip()
            if not text:
                raise RuntimeError("Gemini returned an empty response.")
            self._last_llm_provider = "gemini"
            return text
        except Exception as exc:
            raise RuntimeError(f"Gemini request failed: {exc}") from exc

    def _call_groq(self, prompt: str) -> str:
        """Call Groq Llama model and return text response with safe fallback."""
        try:
            chat = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
            )
            content = chat.choices[0].message.content
            self._last_llm_provider = "groq"
            return (content or "").strip() or "Unable to generate explanation at this time."
        except Exception:
            self._last_llm_provider = "groq"
            return "Unable to generate explanation at this time."

    def _call_llm(self, prompt: str) -> str:
        """Try Gemini first, then fallback to Groq if Gemini fails."""
        try:
            return self._call_gemini(prompt)
        except Exception:
            print("Gemini failed, falling back to Groq")
            return self._call_groq(prompt)

    def generate_explanation(
        self, content: str, detection_results: dict[str, Any], language: str = "en"
    ) -> str:
        """Generate a concise, user-facing explanation in the requested language."""
        try:
            lang_name = self.language_names.get(language, "English")
            prompt = f"""
You are a fact-checking assistant helping users understand misinformation.
Respond entirely in {lang_name}.

ANALYZED CONTENT (first 500 characters):
{content[:500]}

DETECTION FINDINGS:
{json.dumps(detection_results, indent=2)[:1000]}

Please provide a clear, calm, factual response with THREE sections:
1. WHY THIS IS SUSPICIOUS: List 2-3 specific reasons why this content may be misleading
2. WHAT IS ACTUALLY TRUE: Provide a factual, corrected summary of the topic
3. WHAT TO CHECK: Tell the user what they can verify themselves to confirm

Keep your response concise (under 300 words). Be helpful and informative, not alarmist.
Do not repeat the detection numbers - explain them in plain language.
"""
            return self._call_llm(prompt.strip())
        except Exception:
            return "Unable to generate explanation at this time."

    def generate_media_literacy_tip(self, verdict: str) -> str:
        """Return a one-line media literacy tip based on the verdict category."""
        verdict_upper = (verdict or "").upper()
        tips = {
            "FAKE": "Tip: Verify major claims through at least two independent fact-checking sources.",
            "MISINFORMATION": "Tip: Cross-check viral claims with official sources before sharing.",
            "SUSPICIOUS": "Tip: Pause before sharing and verify whether trusted outlets report the same claim.",
            "DEEPFAKE": "Tip: Always verify videos by checking if the original source published it.",
            "MANIPULATED": "Tip: Look for the earliest upload and compare it with reliable archives.",
            "CLONED": "Tip: Confirm unusual audio clips with official statements or full-length recordings.",
            "TRUSTED": "Tip: Even reliable content is best validated with source context and publication date.",
        }
        return tips.get(
            verdict_upper,
            "Tip: Check source credibility, publication date, and independent corroboration before trusting content.",
        )

    def get_alternative_sources(
        self, topic: str, language: str = "en"
    ) -> list[dict[str, Any]]:
        """Fetch alternative relevant news sources from NewsAPI."""
        try:
            url = "https://newsapi.org/v2/everything"
            params = {
                "q": topic[:100],
                "sortBy": "relevancy",
                "pageSize": 5,
                "apiKey": self.news_api_key,
                "language": "en",
            }
            _ = language  # Reserved for future localization support.
            response = requests.get(url, params=params, timeout=20)
            if response.status_code >= 400:
                return []

            articles = response.json().get("articles", [])
            if not isinstance(articles, list):
                return []

            sources: list[dict[str, Any]] = []
            for article in articles:
                if not isinstance(article, dict):
                    continue
                article_url = article.get("url")
                if not article_url:
                    continue
                source_info = article.get("source", {})
                source_name = (
                    source_info.get("name", "") if isinstance(source_info, dict) else ""
                )
                sources.append(
                    {
                        "title": article.get("title", ""),
                        "url": article_url,
                        "source": source_name,
                        "published_at": article.get("publishedAt", ""),
                        "description": str(article.get("description", "") or "")[:200],
                    }
                )
                if len(sources) >= 5:
                    break
            return sources
        except Exception:
            return []

    def generate_full_response(
        self,
        content: str,
        detection_results: dict[str, Any],
        fact_check_results: list[dict[str, Any]],
        trust_score: dict[str, Any],
        language: str = "en",
    ) -> dict[str, Any]:
        """Build a full countermeasure package for frontend/API consumers."""
        try:
            merged_findings = {
                "detection_results": detection_results,
                "fact_check_results": fact_check_results,
                "trust_score": trust_score,
            }
            explanation = self.generate_explanation(content, merged_findings, language)
            topic = (content or "").strip()[:80]
            alternative_sources = self.get_alternative_sources(topic, language)
            verdict = str(trust_score.get("verdict", "SUSPICIOUS"))
            media_literacy_tip = self.generate_media_literacy_tip(verdict)

            return {
                "explanation": explanation,
                "alternative_sources": alternative_sources,
                "media_literacy_tip": media_literacy_tip,
                "language_used": language,
                "llm_provider": self._last_llm_provider,
            }
        except Exception:
            return {
                "explanation": "Unable to generate explanation at this time.",
                "alternative_sources": [],
                "media_literacy_tip": self.generate_media_literacy_tip("SUSPICIOUS"),
                "language_used": language,
                "llm_provider": self._last_llm_provider,
            }
