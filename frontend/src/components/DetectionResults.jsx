import { useState, useRef, useEffect } from "react";

function pct(value) {
  return Math.round((Number(value) || 0) * 100);
}

function getSeverityColor(percent) {
  if (percent >= 70) return "text-red-500";
  if (percent >= 40) return "text-orange-500";
  return "text-green-500";
}

function Badge({ text, type = "blue" }) {
  const colorMap = {
    blue: "badge-blue",
    green: "badge-green",
    orange: "badge-orange",
    red: "badge-red",
  };
  return (
    <span className={`${colorMap[type] || "badge-blue"} animate-glow-pulse`}>
      {text}
    </span>
  );
}

function ProgressRow({ label, percent }) {
  const [width, setWidth] = useState(0);
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  const colorClass = getSeverityColor(clamped);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(clamped), 100);
    return () => clearTimeout(timer);
  }, [clamped]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
        <span>{label}</span>
      </div>
      <div className="relative flex items-center gap-4">
        <div className="progress-bar-3d flex-1">
          <div
            className={`progress-bar-3d-fill ${colorClass}`}
            style={{ width: `${width}%` }}
          />
        </div>
        <span className={`text-sm font-bold font-display min-w-[32px] text-right ${colorClass}`}>
          {clamped}%
        </span>
      </div>
    </div>
  );
}

function AccordionItem({ id, icon, title, gradient, children, isOpen, onToggle }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    setHeight(isOpen ? `${contentRef.current.scrollHeight}px` : "0px");
  }, [isOpen]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 transition-all duration-300">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className={`flex w-full items-center justify-between p-3 transition-all duration-300 ${
          isOpen
            ? "glass-blue border border-blue-200/40 bg-blue-50/30"
            : "hover:bg-gray-50/50 border border-transparent"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-blue-200/20 text-xl`}>
            {icon}
          </div>
          <span className={`font-display font-bold text-sm ${isOpen ? "text-blue-900" : "text-gray-700"}`}>
            {title}
          </span>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-blue-500" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        ref={contentRef}
        style={{ maxHeight: height }}
        className="transition-all duration-300 ease-in-out overflow-hidden"
      >
        <div className="p-5 space-y-6 bg-white/30 backdrop-blur-sm border-t border-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
}

function DetectionResults({ detection = {}, modality = "text" }) {
  const panels = [];

  if (detection?.text) panels.push("text");
  if (detection?.text?.ai_probability !== undefined) panels.push("ai");
  if (detection?.image) panels.push("image");
  if (detection?.audio) panels.push("audio");
  if (detection?.video) panels.push("video");
  if (detection?.fact_check) panels.push("fact_check");

  const [allOpen, setAllOpen] = useState(true);
  const [openPanels, setOpenPanels] = useState(() =>
    panels.reduce((acc, panel) => ({ ...acc, [panel]: true }), {})
  );

  const togglePanel = (panel) => {
    setOpenPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  const toggleAll = () => {
    const newState = !allOpen;
    setOpenPanels(panels.reduce((acc, panel) => ({ ...acc, [panel]: newState }), {}));
    setAllOpen(newState);
  };

  const text = detection?.text || {};
  const image = detection?.image || {};
  const audio = detection?.audio || {};
  const video = detection?.video || {};
  const factCheck = detection?.fact_check || [];

  return (
    <section className="trust-card space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display font-bold text-lg text-gray-900">
            Detection Results
          </h2>
          <Badge text="Live Analysis" type="blue" />
        </div>
        <button 
          onClick={toggleAll} 
          className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"
          type="button"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="space-y-4">
        {detection?.text && (
          <AccordionItem
            id="text"
            icon="📰"
            title="Fake News Analysis"
            gradient="from-blue-600 to-indigo-600"
            isOpen={!!openPanels.text}
            onToggle={togglePanel}
          >
            <div className="space-y-5">
              <ProgressRow
                label="Fake News Probability"
                percent={pct(text.fake_probability)}
              />
              <ProgressRow 
                label="AI Author Probability" 
                percent={pct(text.ai_probability)} 
              />
              <div className="pt-2">
                <div className="w-full glass-blue p-4 border border-blue-200/30 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">Classification</span>
                    <span className="font-display font-black text-xl text-blue-900 tracking-tight">
                      {text.classification || "UNKNOWN"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Model Confidence</span>
                    <p className="font-display font-bold text-gray-900">
                      {Math.round((Number(text.confidence) || 0) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionItem>
        )}

        {detection?.image && (
          <AccordionItem
            id="image"
            icon="🖼️"
            title="Image Authenticity"
            gradient="from-emerald-600 to-teal-600"
            isOpen={!!openPanels.image}
            onToggle={togglePanel}
          >
            <div className="flex flex-col items-center justify-center py-4 gap-4">
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Deepfake Probability</span>
                <p className={`text-6xl font-display font-black tracking-tighter ${getSeverityColor(pct(image.deepfake_probability || image.ensemble_probability))}`}>
                  {pct(image.deepfake_probability || image.ensemble_probability)}%
                </p>
              </div>
              
              <div className="w-full grid gap-4 pt-4">
                <ProgressRow label="Model 1 (ViT-Base)" percent={pct(image.model_1_score)} />
                <ProgressRow label="Model 2 (ViT-Large)" percent={pct(image.model_2_score)} />
              </div>

              <div className="w-full flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                <Badge text={image.verdict || "ANALYZING"} type={pct(image.deepfake_probability) > 50 ? "red" : "green"} />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Confidence: {image.confidence || "0%"}
                </span>
              </div>
            </div>
          </AccordionItem>
        )}

        {detection?.audio && (
          <AccordionItem
            id="audio"
            icon="🎙️"
            title="Audio Authenticity"
            gradient="from-purple-600 to-pink-600"
            isOpen={!!openPanels.audio}
            onToggle={togglePanel}
          >
            <div className="space-y-6">
              <ProgressRow label="Voice Clone Score" percent={pct(audio.voice_clone_score)} />
              
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Audio Transcript</span>
                <div className="rounded-xl bg-gray-950/5 border border-gray-200/50 p-4 text-sm font-mono text-gray-700 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                  {audio.transcript || "No transcript available for this audio segment."}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Badge text={`Detected Language: ${audio.language || "Unknown"}`} type="blue" />
              </div>
            </div>
          </AccordionItem>
        )}

        {detection?.fact_check && factCheck.length > 0 && (
          <AccordionItem
            id="fact_check"
            icon="✅"
            title="Fact Check Verification"
            gradient="from-amber-500 to-orange-600"
            isOpen={!!openPanels.fact_check}
            onToggle={togglePanel}
          >
            <div className="space-y-4">
              {factCheck.map((item, idx) => {
                const isFalse = item.truthfulness === "FALSE";
                const isTrue = item.truthfulness === "TRUE";
                const borderColor = isTrue ? "border-green-500" : isFalse ? "border-red-500" : "border-gray-400";
                
                return (
                  <div key={idx} className={`p-4 border-l-4 rounded-r-xl bg-gray-50/50 border-y border-r border-gray-100 ${borderColor} space-y-3`}>
                    <p className="text-sm font-bold text-gray-900 line-clamp-2">"{item.claim}"</p>
                    <div className="flex items-center justify-between">
                      <Badge 
                        text={item.truthfulness} 
                        type={isTrue ? "green" : isFalse ? "red" : "orange"} 
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">Source:</span>
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          {item.reviewer}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionItem>
        )}
      </div>
    </section>
  );
}

export default DetectionResults;
