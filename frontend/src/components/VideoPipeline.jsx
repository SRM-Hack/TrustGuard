const STAGES = [
  { icon: "📷", title: "Frame Extraction", desc: "Sampling video frames" },
  { icon: "🔍", title: "Deepfake Detection", desc: "ViT ensemble analysis" },
  { icon: "🎙️", title: "Audio Analysis", desc: "Voice clone detection" },
  { icon: "📊", title: "Score Calculation", desc: "Trust score aggregation" },
];

function VideoPipeline({ activeStage = 0, isComplete = false }) {
  return (
    <div className="trust-card !p-8 space-y-8 animate-fade-in-up">
      {isComplete && (
        <div className="flex justify-center animate-bounce">
          <span className="badge-green !bg-green-500/10 !text-green-600 font-black text-xs uppercase px-4 py-1.5 rounded-full shadow-lg shadow-green-100">
            ✅ Analysis Complete
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-4 relative">
        {STAGES.map((stage, idx) => {
          const isFinished = isComplete || idx < activeStage;
          const isActive = !isComplete && idx === activeStage;
          const isPending = !isComplete && idx > activeStage;

          return (
            <div key={idx} className="flex flex-col items-center flex-1 relative z-10">
              {/* Icon Box */}
              <div className="relative group">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 shadow-xl ${
                  isFinished ? 'bg-green-500 text-white shadow-green-200' : 
                  isActive ? 'bg-blue-600 text-white shadow-blue-200 animate-glow-pulse' : 
                  'bg-gray-100 text-gray-400 border border-gray-100'
                }`}>
                  {isFinished ? (
                    <div className="relative">
                      <span>{stage.icon}</span>
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 text-green-600 text-[10px] shadow-md border border-green-100">
                        ✓
                      </div>
                    </div>
                  ) : stage.icon}
                </div>

                {/* Stage Number Badge */}
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
                  {idx + 1}
                </div>
              </div>

              {/* Text Below */}
              <div className="mt-4 text-center space-y-1">
                <p className={`text-xs font-bold uppercase tracking-widest ${
                  isActive ? 'text-blue-600' : isFinished ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {stage.title}
                </p>
                <p className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                  {stage.desc}
                </p>
              </div>

              {/* Connecting Line (Desktop) */}
              {idx < STAGES.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-[2px]">
                  <div className="absolute inset-0 bg-gray-100" />
                  <div className={`absolute inset-0 transition-all duration-1000 ${
                    isFinished ? 'bg-green-400 w-full' : isActive ? 'bg-blue-400 w-full' : 'w-0'
                  }`} />
                  
                  {isActive && (
                    <div className="absolute top-1/2 left-0 h-2 w-2 bg-blue-600 rounded-full -translate-y-1/2 animate-[move-dot_1.5s_linear_infinite]" />
                  )}
                </div>
              )}

              {/* Connecting Line (Mobile) */}
              {idx < STAGES.length - 1 && (
                <div className="md:hidden absolute top-14 left-7 w-[2px] h-8 mt-2">
                  <div className="absolute inset-0 bg-gray-100" />
                  <div className={`absolute inset-0 transition-all duration-1000 ${
                    isFinished ? 'bg-green-400 h-full' : isActive ? 'bg-blue-400 h-full' : 'h-0'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes move-dot {
          0% { left: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}

export default VideoPipeline;
