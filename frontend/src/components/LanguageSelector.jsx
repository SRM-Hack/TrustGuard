const options = [
  { value: "auto", label: "Auto", icon: "🌐" },
  { value: "en", label: "EN", icon: "🇬🇧" },
  { value: "hi", label: "HI", icon: "🇮🇳" },
  { value: "te", label: "TE", icon: "🇮🇳" },
];

function LanguageSelector({ value = "auto", onChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 pl-1">
        Language
      </span>
      
      <div className="grid grid-cols-2 sm:flex bg-gray-100/80 rounded-2xl p-1 gap-0.5 backdrop-blur-sm border border-gray-200/50">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange?.(option.value)}
              className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center sm:justify-start gap-1.5 ${
                isSelected
                  ? "bg-white text-blue-600 shadow-card scale-[1.02] shadow-[0_4px_12px_rgba(37,99,235,0.20)]"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <span className="text-xs">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LanguageSelector;
