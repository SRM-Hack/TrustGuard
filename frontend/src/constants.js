export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

export const LANGUAGE_OPTIONS = [
  { value: "auto", label: "Auto-detect", flag: "🌐" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "hi", label: "Hindi (हिन्दी)", flag: "🇮🇳" },
  { value: "te", label: "Telugu (తెలుగు)", flag: "🇮🇳" },
];

export const VERDICT_CONFIG = {
  TRUSTED: {
    color: "#16A34A",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    emoji: "✅",
    description: "Content appears to be authentic and verifiable.",
    badgeClass: "badge-green",
  },
  SUSPICIOUS: {
    color: "#D97706",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    emoji: "⚠️",
    description: "Some warning signals found. Verify with supporting evidence.",
    badgeClass: "badge-orange",
  },
  MISINFORMATION: {
    color: "#DC2626",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    emoji: "🚨",
    description: "High risk of misinformation. Independent verification strongly recommended.",
    badgeClass: "badge-red",
  },
};

export const MAX_FILE_SIZE_MB = 50;

export const LOADING_MESSAGES = [
  "Analyzing content with AI models...",
  "Cross-checking against fact databases...",
  "Generating explanation with Gemini...",
  "Calculating trust score...",
];

export const SAMPLE_TEXTS = {
  hi: "अर्जेंट खबर! सरकार ने घोषणा की है कि सभी बैंक खाते 48 घंटे के लिए फ्रीज हो जाएंगे। सभी को अभी पैसे निकाल लेने चाहिए! यह खबर सोशल मीडिया पर वायरल हो रही है।",
  en: "BREAKING: Scientists at MIT have confirmed that drinking hot water with lemon every morning can cure cancer in 30 days. Big pharma is suppressing this information. Share before it gets deleted!",
  te: "అత్యవసర వార్త! ప్రభుత్వం అన్ని బ్యాంక్ ఖాతాలను 48 గంటలు బ్లాక్ చేయనున్నది. వెంటనే డబ్బులు తీసుకోండి!",
};
