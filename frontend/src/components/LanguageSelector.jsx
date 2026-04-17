function LanguageSelector({ value = "en", onChange, showLabel = false, includeAuto = false }) {
  const options = [
    ...(includeAuto ? [{ value: "auto", label: "Auto", icon: "🌐" }] : []),
    { value: "en", label: "English", icon: "🇬🇧" },
    { value: "hi", label: "हिन्दी", icon: "🇮🇳" },
    { value: "te", label: "తెలుగు", icon: "🇮🇳" },
  ];
  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-1">
          Language
        </span>
      )}
      
      <div className="flex bg-gray-100/80 rounded-2xl p-1 gap-1 backdrop-blur-sm border border-gray-200/50 relative overflow-hidden">
        {/* Active background slider effect could be added here with absolute positioning if needed */}
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange?.(option.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 relative z-10 ${
                isSelected
                  ? "bg-white text-blue-600 shadow-md scale-[1.05] ring-1 ring-blue-500/10"
                  : "text-gray-500 hover:text-blue-500 hover:bg-white/40"
              }`}
            >
              <span className="text-sm grayscale-[0.2] group-hover:grayscale-0 transition-all">{option.icon}</span>
              <span className="tracking-tight">{option.label}</span>
              {isSelected && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LanguageSelector;
