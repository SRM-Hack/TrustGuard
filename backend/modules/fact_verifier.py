"""Fact verification engine using Google Fact Check Tools and Serper."""

from __future__ import annotations

from typing import Any

import requests
import spacy

from config import FACT_CHECK_KEY, SERPER_KEY


class FactVerifier:
    """Extract and verify factual claims from text content."""

    def __init__(self) -> None:
        """Initialize API keys, tuning constants, and SpaCy pipeline."""
        self.fact_check_key = FACT_CHECK_KEY
        self.serper_key = SERPER_KEY
        self.max_claims_to_check = 3
        try:
            self.nlp = spacy.load("en_core_web_sm")
            self.spacy_available = True
        except Exception:
            self.nlp = None
            self.spacy_available = False
            print(
                "WARNING: spacy en_core_web_sm not available. "
                "Using fallback claim extraction."
            )

    def extract_claims(self, text: str) -> list[str]:
        """Extract top claim-worthy sentences from input text."""
        if not self.spacy_available or not self.nlp:
            # Fallback: split on sentences and return the longest ones as claims.
            sentences = [
                s.strip()
                for s in text.replace("! ", ". ").replace("? ", ". ").split(". ")
                if len(s.strip()) > 20
            ]
            sentences.sort(key=len, reverse=True)
            return sentences[: self.max_claims_to_check]

        try:
            non_ascii_ratio = sum(1 for c in text if ord(c) > 127) / max(len(text), 1)
            if non_ascii_ratio > 0.3:
                # Non-Latin script - SpaCy won't detect entities reliably.
                sentences = [
                    s.strip() for s in text.replace("।", ".").split(".") if len(s.strip()) > 10
                ]
                sentences.sort(key=len, reverse=True)
                return sentences[: self.max_claims_to_check]

            doc = self.nlp(text)
            candidate_claims: list[tuple[str, int]] = []
            allowed_entities = {"PERSON", "ORG", "GPE", "DATE", "MONEY", "PERCENT"}

            for sent in doc.sents:
                sentence = sent.text.strip()
                if not sentence or sentence.endswith("?"):
                    continue
                if len(sentence) < 10 or len(sentence) > 200:
                    continue
                if sentence.lower().startswith(("i ", "we ", "you ")):
                    continue

                has_root = any(token.dep_ == "ROOT" for token in sent)
                if not has_root:
                    continue

                entity_count = sum(1 for ent in sent.ents if ent.label_ in allowed_entities)
                if entity_count <= 0:
                    continue

                candidate_claims.append((sentence, entity_count))

            if candidate_claims:
                candidate_claims.sort(key=lambda item: item[1], reverse=True)
                ranked_claims = [claim for claim, _ in candidate_claims]
                return ranked_claims[: self.max_claims_to_check]

            fallback = [s.strip() for s in text.split(". ") if s.strip()]
            return fallback[: self.max_claims_to_check]
        except Exception:
            fallback = [s.strip() for s in text.split(". ") if s.strip()]
            return fallback[: self.max_claims_to_check]

    def google_fact_check(self, claim: str, lang: str = "en") -> list[dict[str, Any]]:
        """Query Google Fact Check Tools API for claim reviews."""
        try:
            url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
            params = {
                "query": claim,
                "key": self.fact_check_key,
                "languageCode": lang,
                "pageSize": 5,
            }
            response = requests.get(url, params=params, timeout=25)
            if response.status_code >= 400:
                return []

            claims = response.json().get("claims", [])
            if not isinstance(claims, list):
                return []

            parsed_results: list[dict[str, Any]] = []
            for item in claims:
                if not isinstance(item, dict):
                    continue
                reviews = item.get("claimReview", [])
                review = reviews[0] if isinstance(reviews, list) and reviews else {}
                if not isinstance(review, dict):
                    review = {}

                parsed_results.append(
                    {
                        "text": item.get("text", ""),
                        "claimant": item.get("claimant", "Unknown"),
                        "rating": review.get("textualRating", "Unrated"),
                        "reviewer": review.get("publisher", {}).get("name", "")
                        if isinstance(review.get("publisher"), dict)
                        else "",
                        "url": review.get("url", ""),
                        "review_date": review.get("reviewDate", ""),
                    }
                )

            return parsed_results
        except Exception:
            return []

    def search_evidence(self, claim: str) -> list[dict[str, Any]]:
        """Retrieve supporting evidence snippets from Serper news search."""
        try:
            url = "https://google.serper.dev/news"
            headers = {
                "X-API-KEY": self.serper_key,
                "Content-Type": "application/json",
            }
            payload = {"q": claim, "num": 5}
            response = requests.post(url, headers=headers, json=payload, timeout=25)
            if response.status_code >= 400:
                return []

            news_results = response.json().get("news", [])
            if not isinstance(news_results, list):
                return []

            evidence: list[dict[str, Any]] = []
            for article in news_results[:5]:
                if not isinstance(article, dict):
                    continue
                evidence.append(
                    {
                        "title": article.get("title", ""),
                        "link": article.get("link", ""),
                        "snippet": article.get("snippet", ""),
                        "source": article.get("source", ""),
                        "date": article.get("date", ""),
                    }
                )
            return evidence
        except Exception:
            return []

    def assess_claim_truthfulness(self, gfc_results: list[dict[str, Any]]) -> str:
        """Classify truthfulness from fact-check textual ratings."""
        try:
            ratings = [
                str(result.get("rating", "")).lower()
                for result in gfc_results
                if isinstance(result, dict)
            ]

            false_markers = {
                "false",
                "fake",
                "wrong",
                "misleading",
                "incorrect",
                "pants on fire",
            }
            true_markers = {"true", "correct", "accurate", "mostly true"}

            if any(any(marker in rating for marker in false_markers) for rating in ratings):
                return "FALSE"
            if any(any(marker in rating for marker in true_markers) for rating in ratings):
                return "TRUE"
            return "UNVERIFIED"
        except Exception:
            return "UNVERIFIED"

    def verify_claims(self, text: str) -> list[dict[str, Any]]:
        """Run end-to-end claim extraction, fact-checking, and evidence lookup."""
        try:
            claims = self.extract_claims(text)
            results: list[dict[str, Any]] = []

            for claim in claims:
                gfc_results = self.google_fact_check(claim)
                evidence = self.search_evidence(claim)
                truthfulness = self.assess_claim_truthfulness(gfc_results)

                results.append(
                    {
                        "claim": claim,
                        "truthfulness": truthfulness,
                        "fact_check_results": gfc_results,
                        "evidence": evidence,
                        "has_fact_check_coverage": bool(gfc_results),
                    }
                )

            return results
        except Exception:
            return []
