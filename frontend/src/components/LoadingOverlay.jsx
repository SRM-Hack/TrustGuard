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
    <div className={`absolute inset-0 z-20 rounded-2xl bg-white/70 backdrop-blur-sm transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        {/* 3D Custom Spinner */}
        <div className="relative flex items-center justify-center h-20 w-20">
          {/* Ring 1 */}
          <div className="absolute h-14 w-14 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
          {/* Ring 2 */}
          <div className="absolute h-10 w-10 rounded-full border-4 border-transparent border-r-indigo-400 animate-[spin_1.5s_linear_infinite_reverse]" />
          {/* Ring 3 */}
          <div className="absolute h-6 w-6 rounded-full border-4 border-transparent border-b-emerald-400 animate-[spin_2s_linear_infinite]" />
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-gray-600 transition-opacity duration-300">
            {safeMessages[currentIndex]}
          </p>
          
          {/* Progress Dots */}
          <div className="flex justify-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse [animation-delay:200ms]" />
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse [animation-delay:400ms]" />
          </div>
        </div>

        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Analysis in progress
        </p>
      </div>
    </div>
  );
}

export default LoadingOverlay;
