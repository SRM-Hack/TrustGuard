export const API_BASE_URL = "http://localhost:8000";

export const SAMPLE_TEXTS = {
  en: "BREAKING: Government has secretly decided to freeze all bank accounts across India for 48 hours! Withdraw your money immediately tonight! Share this urgent alert with everyone you know!",
  hi: "अर्जेंट खबर! सरकार ने घोषणा की है कि सभी बैंक खाते 48 घंटे के लिए फ्रीज हो जाएंगे। सभी को अभी पैसे निकाल लेने चाहिए! इस मैसेज को सभी को फॉरवर्ड करें!",
  te: "అత్యవసర వార్త! ప్రభుత్వం అన్ని బ్యాంకు ఖాతాలను 48 గంటల పాటు ఫ్రీజ్ చేయాలని నిర్ణయించింది. వెంటనే డబ్బులు తీసుకోండి!",
};

export const VERDICT_CONFIG = {
  TRUSTED: {
    color: "#16A34A",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    emoji: "✅",
    description: "Content appears authentic and verified through multiple sources.",
    borderColor: "border-green-200",
  },
  SUSPICIOUS: {
    color: "#D97706",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    emoji: "⚠️",
    description: "Some indicators of potential manipulation or unverified claims detected.",
    borderColor: "border-amber-200",
  },
  MISINFORMATION: {
    color: "#DC2626",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    emoji: "🚨",
    description: "Strong indicators of false or intentionally misleading content.",
    borderColor: "border-red-200",
  },
};

export const LOADING_MESSAGES = [
  "Initializing neural engines...",
  "Analyzing semantic structures...",
  "Scanning multi-modal features...",
  "Cross-referencing global databases...",
  "Calculating trust probabilities...",
];
