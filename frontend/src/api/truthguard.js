import axios from "axios";
import { API_BASE_URL } from "../constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

function extractErrorMessage(error, fallback) {
  const message =
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;
  return message;
}

api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === "development") {
      const method = (config.method || "get").toUpperCase();
      const url = `${config.baseURL || ""}${config.url || ""}`;
      // Keep this minimal so debugging is easy without noisy payloads.
      console.log(`[TruthGuard API] ${method} ${url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendMessage = extractErrorMessage(
      error,
      "Request failed. Please try again."
    );
    return Promise.reject(new Error(backendMessage));
  }
);

export function formatProcessingTime(ms) {
  const numericMs = Number(ms) || 0;
  if (numericMs < 1000) {
    return `${(numericMs / 1000).toFixed(1)}s`;
  }
  return `${(numericMs / 1000).toFixed(1)}s`;
}

export async function analyzeText(text, language = "auto") {
  const formData = new FormData();
  formData.append("text", text);
  formData.append("language", language);

  try {
    const response = await api.post("/analyze/text", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Text analysis failed"));
  }
}

export async function analyzeImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/analyze/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Image analysis failed"));
  }
}

export async function analyzeAudio(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/analyze/audio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 180000,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Audio analysis failed"));
  }
}

export async function analyzeVideo(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/analyze/video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 300000,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Video analysis failed"));
  }
}

export async function checkHealth() {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    return { status: "error" };
  }
}
