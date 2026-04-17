export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

export const LANGUAGE_OPTIONS = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi (हिन्दी)" },
  { value: "te", label: "Telugu (తెలుగు)" },
];

export const VERDICT_CONFIG = {
  TRUSTED: {
    color: "truthguard-green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  SUSPICIOUS: {
    color: "truthguard-orange",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
  },
  MISINFORMATION: {
    color: "truthguard-red",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
};

export const MAX_FILE_SIZE_MB = 50;
