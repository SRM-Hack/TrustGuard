import { useEffect, useState } from "react";
import { LOADING_MESSAGES } from "../constants";

function LoadingOverlay({ isLoading, messages = LOADING_MESSAGES }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const safeMessages = messages?.length ? messages : LOADING_MESSAGES;

  useEffect(() => {
    if (!isLoading || safeMessages.length === 0) {
      setCurrentIndex(0);
      return undefined;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeMessages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isLoading, safeMessages]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-10 rounded-2xl bg-white/80 backdrop-blur-sm opacity-100 transition-opacity duration-200">
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-truthguard-blue" />
        <p className="mt-4 text-sm font-medium text-gray-600">
          {safeMessages[currentIndex]}
        </p>
        <p className="mt-2 text-xs text-gray-400">
          This may take up to 60 seconds for audio/video
        </p>
      </div>
    </div>
  );
}

export default LoadingOverlay;
