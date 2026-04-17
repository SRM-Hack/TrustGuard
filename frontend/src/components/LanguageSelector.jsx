const options = [
  { value: "auto", label: "Auto", icon: "🌐" },
  { value: "en", label: "English", icon: "🇬🇧" },
  { value: "hi", label: "Hindi", icon: "🇮🇳" },
  { value: "te", label: "Telugu (తెలుగు)", icon: "🇮🇳" },
];

function LanguageSelector({ value = "auto", onChange }) {
  return (
    <section>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Language
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange?.(option.value)}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default LanguageSelector;
