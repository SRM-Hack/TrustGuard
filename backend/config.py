"""
Central configuration for TruthGuard backend.

Loads environment variables from backend/.env and exposes strongly named
constants used across modules.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Resolve backend directory and load environment variables from backend/.env.
BACKEND_DIR = Path(__file__).resolve().parent
ENV_PATH = BACKEND_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

BACKEND_VERSION = "1.0.0"

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
}


def _get_env_var(name: str, *, required: bool = True) -> str:
    """
    Read an environment variable with optional strict validation.

    Args:
        name: Environment variable name.
        required: Whether the variable must be present and non-empty.

    Returns:
        The environment variable value (or empty string if not required).

    Raises:
        RuntimeError: If required variable is missing or empty.
    """
    value = os.getenv(name, "").strip()
    if required and not value:
        raise RuntimeError(
            f"Missing required environment variable: {name}. "
            f"Set it in {ENV_PATH} before starting the backend."
        )
    return value


# API keys used by TruthGuard modules.
GEMINI_API_KEY = _get_env_var("GEMINI_API_KEY")
GROQ_API_KEY = _get_env_var("GROQ_API_KEY")
SERPER_KEY = _get_env_var("SERPER_KEY")
HF_TOKEN = _get_env_var("HF_TOKEN")
NEWS_API_KEY = _get_env_var("NEWS_API_KEY")
FACT_CHECK_KEY = _get_env_var("FACT_CHECK_KEY")