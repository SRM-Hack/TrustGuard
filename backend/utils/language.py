"""Language detection and translation utilities for TruthGuard."""

from __future__ import annotations

import time

from langdetect import detect
import google.generativeai as genai
import requests

from config import GEMINI_API_KEY, SUPPORTED_LANGUAGES

GEMINI_MODEL = "gemini-2.0-flash"
REQUESTS_USER_AGENT = requests.utils.default_user_agent()


def detect_language(text: str) -> str:
    """Detect the language code for input text with safe fallbacks.

    Returns "en" when text is too short, detection fails, or the detected
    language is not part of SUPPORTED_LANGUAGES.
    """
    if not text or len(text.strip()) < 20:
        return "en"

    try:
        devanagari_chars = sum(1 for c in text if "\u0900" <= c <= "\u097F")
        if devanagari_chars / max(len(text), 1) > 0.2:
            return "hi"

        telugu_chars = sum(1 for c in text if "\u0C00" <= c <= "\u0C7F")
        if telugu_chars / max(len(text), 1) > 0.2:
            return "te"

        lang_code = detect(text)
        return lang_code if lang_code in SUPPORTED_LANGUAGES else "en"
    except Exception:
        return "en"


def translate_to_english(text: str, source_lang: str) -> str:
    """Translate source language text to English using Gemini.

    Returns the original text on any exception to avoid breaking the pipeline.
    """
    if not text or source_lang == "en":
        return text

    source_language = get_language_name(source_lang)
    prompt = (
        f"Translate the following {source_language} text to English. "
        f"Return only the translation, nothing else: {text}"
    )

    for attempt in range(3):
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel(GEMINI_MODEL)
            response = model.generate_content(prompt)
            translated = (response.text or "").strip()
            if translated:
                return translated
        except Exception:
            if attempt < 2:
                time.sleep(2)
                continue
            return text
        if attempt < 2:
            time.sleep(2)
    return text


def translate_from_english(text: str, target_lang: str) -> str:
    """Translate English text to the requested target language using Gemini.

    Returns the original text on any exception to ensure graceful degradation.
    """
    if not text or target_lang == "en":
        return text

    target_language = get_language_name(target_lang)
    prompt = (
        f"Translate the following English text to {target_language}. "
        f"Return only the translation, no preamble: {text}"
    )

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(prompt)
        translated = (response.text or "").strip()
        return translated if translated else text
    except Exception:
        return text


def get_language_name(lang_code: str) -> str:
    """Return the display name for a language code."""
    return SUPPORTED_LANGUAGES.get(lang_code, "English")
