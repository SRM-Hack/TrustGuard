import { useState } from "react";

function pct(value) {
  return Math.round((Number(value) || 0) * 100);
}

function getSeverityColor(percent) {
  if (percent >= 70) return "bg-red-500";
  if (percent >= 40) return "bg-amber-500";
  return "bg-green-500";
}

function Badge({ text, colorClass }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colorClass}`}
    >
      {text}
    </span>
  );
}

function ProgressRow({ label, percent }) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{clamped}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full ${getSeverityColor(clamped)}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function AccordionItem({ id, icon, title, children, isOpen, onToggle }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
          isOpen
            ? "bg-gray-50 text-gray-900 font-semibold"
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span className="font-semibold">
          {icon} {title}
        </span>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-300 ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 bg-white p-4">{children}</div>
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
    if (allOpen) {
      setOpenPanels(panels.reduce((acc, panel) => ({ ...acc, [panel]: false }), {}));
      setAllOpen(false);
    } else {
      setOpenPanels(panels.reduce((acc, panel) => ({ ...acc, [panel]: true }), {}));
      setAllOpen(true);
    }
  };

  const text = detection?.text || {};
  const image = detection?.image || {};
  const audio = detection?.audio || {};
  const video = detection?.video || {};
  const factCheck = detection?.fact_check || [];

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Detection Results
        </h2>
        <button onClick={toggleAll} className="text-xs text-blue-600 hover:underline" type="button">
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="space-y-3">
        {detection?.text && (
          <AccordionItem
            id="text"
            icon="📰"
            title="Fake News Analysis"
            isOpen={!!openPanels.text}
            onToggle={togglePanel}
          >
            <ProgressRow
              label="Fake Probability"
              percent={pct(text.fake_probability)}
            />
            <ProgressRow label="AI Probability" percent={pct(text.ai_probability)} />
            <div className="flex items-center justify-between">
              <Badge
                text={text.classification || "UNKNOWN"}
                colorClass="bg-blue-100 text-blue-700"
              />
              <span className="text-sm text-gray-600">
                Confidence:{" "}
                <span className="font-semibold text-gray-900">
                  {Math.round((Number(text.confidence) || 0) * 100)}%
                </span>
              </span>
            </div>
          </AccordionItem>
        )}

        {detection?.text?.ai_probability !== undefined && (
          <AccordionItem
            id="ai"
            icon="🤖"
            title="AI-Generated Text"
            isOpen={!!openPanels.ai}
            onToggle={togglePanel}
          >
            <p className="text-4xl font-bold text-gray-900">
              {pct(text.ai_probability)}%
            </p>
            <p className="text-sm text-gray-700">
              This text{" "}
              {pct(text.ai_probability) > 65
                ? "appears to be"
                : "does not appear to be"}{" "}
              AI-generated.
            </p>
            <p
              className="text-sm text-gray-600"
              title="Perplexity estimates language predictability; lower values often suggest more predictable/templated text."
            >
              Perplexity Score:{" "}
              <span className="font-semibold text-gray-900">
                {Number(text.perplexity || 0).toFixed(2)}
              </span>
            </p>
          </AccordionItem>
        )}

        {detection?.image && (
          <AccordionItem
            id="image"
            icon="🖼️"
            title="Image Authenticity"
            isOpen={!!openPanels.image}
            onToggle={togglePanel}
          >
            <p className="text-4xl font-bold text-gray-900">
              {pct(image.deepfake_probability || image.ensemble_probability)}%
            </p>
            <ProgressRow label="Model 1" percent={pct(image.model_1_score)} />
            <ProgressRow label="Model 2" percent={pct(image.model_2_score)} />
            <div className="flex items-center justify-between">
              <Badge
                text={image.confidence || "UNKNOWN"}
                colorClass="bg-gray-100 text-gray-700"
              />
              <span className="text-lg font-bold text-red-600">
                {image.verdict || "No verdict"}
              </span>
            </div>
          </AccordionItem>
        )}

        {detection?.audio && (
          <AccordionItem
            id="audio"
            icon="🎙️"
            title="Audio Authenticity"
            isOpen={!!openPanels.audio}
            onToggle={togglePanel}
          >
            <ProgressRow label="Voice Clone Score" percent={pct(audio.voice_clone_score)} />
            <div className="max-h-32 overflow-y-auto rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
              {audio.transcript || "Transcript unavailable"}
            </div>
            <Badge
              text={`Language: ${audio.language || "unknown"}`}
              colorClass="bg-blue-100 text-blue-700"
            />
          </AccordionItem>
        )}

        {detection?.video && (
          <AccordionItem
            id="video"
            icon="🎬"
            title="Video Analysis"
            isOpen={!!openPanels.video}
            onToggle={togglePanel}
          >
            <ProgressRow label="Overall Deepfake Score" percent={pct(video.deepfake_score)} />
            <p className="text-sm text-gray-700">
              Frames analyzed:{" "}
              <span className="font-semibold text-gray-900">
                {video.frame_count ?? 0}
              </span>
            </p>
            <p className="text-sm text-gray-700">
              Suspicious frames:{" "}
              <span className="font-semibold text-gray-900">
                {video.suspicious_frame_count ?? 0}
              </span>
            </p>
          </AccordionItem>
        )}

        {detection?.fact_check && (
          <AccordionItem
            id="fact_check"
            icon="🔍"
            title="Fact Check Results"
            isOpen={!!openPanels.fact_check}
            onToggle={togglePanel}
          >
            {factCheck.length > 0 ? (
              <div className="space-y-3">
                {factCheck.map((item, index) => {
                  const label = item.truthfulness || "UNVERIFIED";
                  const badgeClass =
                    label === "TRUE"
                      ? "bg-green-100 text-green-700"
                      : label === "FALSE"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700";
                  const links = item.evidence_links || item.links || [];
                  const isBad =
                    label === "FALSE" ||
                    String(item.rating || "")
                      .toLowerCase()
                      .includes("mislead");

                  return (
                    <div
                      key={`${item.claim || "fact"}-${index}`}
                      className="rounded-lg border border-gray-200 p-3"
                    >
                      <p className="font-medium text-gray-900">
                        {isBad && (
                          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                        {item.claim || "Claim unavailable"}
                      </p>
                      <div className="mt-2">
                        <Badge text={label} colorClass={badgeClass} />
                      </div>
                      {item.has_fact_check_coverage && (
                        <p className="mt-2 text-sm text-gray-600">
                          Reviewer:{" "}
                          <span className="font-medium text-gray-900">
                            {item.reviewer || "Unknown"}
                          </span>
                          {" | "}Rating:{" "}
                          <span className="font-medium text-gray-900">
                            {item.rating || "N/A"}
                          </span>
                        </p>
                      )}
                      {links.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {links.slice(0, 3).map((link) => (
                            <a
                              key={link}
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="block truncate text-sm text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                No fact-check coverage found for these claims.
              </p>
            )}
          </AccordionItem>
        )}
      </div>
    </section>
  );
}

export default DetectionResults;
