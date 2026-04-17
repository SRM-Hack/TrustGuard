import { Fragment, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const HISTORY_KEY = "truthguard_analysis_history";

function readHistory() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch (error) {
    return [];
  }
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

function Dashboard() {
  const [analysisHistory] = useState(readHistory);
  const [expandedRow, setExpandedRow] = useState(null);

  const stats = useMemo(() => {
    const total = analysisHistory.length;
    const misinformation = analysisHistory.filter(
      (item) => item.verdict === "MISINFORMATION"
    ).length;
    const suspicious = analysisHistory.filter(
      (item) => item.verdict === "SUSPICIOUS"
    ).length;
    const averageScore = total
      ? Math.round(
          analysisHistory.reduce(
            (sum, item) => sum + (Number(item.trust_score) || 0),
            0
          ) / total
        )
      : 0;

    return { total, misinformation, suspicious, averageScore };
  }, [analysisHistory]);

  const verdictDistribution = useMemo(
    () => [
      {
        name: "Trusted",
        value: analysisHistory.filter((item) => item.verdict === "TRUSTED").length,
        color: "#16A34A",
      },
      {
        name: "Suspicious",
        value: analysisHistory.filter((item) => item.verdict === "SUSPICIOUS").length,
        color: "#D97706",
      },
      {
        name: "Misinformation",
        value: analysisHistory.filter(
          (item) => item.verdict === "MISINFORMATION"
        ).length,
        color: "#DC2626",
      },
    ],
    [analysisHistory]
  );

  const modalityData = useMemo(() => {
    const base = { text: 0, image: 0, audio: 0, video: 0 };
    analysisHistory.forEach((item) => {
      const key = item.modality || "text";
      if (base[key] !== undefined) {
        base[key] += 1;
      }
    });
    return Object.entries(base).map(([modality, count]) => ({
      modality: modality[0].toUpperCase() + modality.slice(1),
      count,
    }));
  }, [analysisHistory]);

  const statCards = [
    { label: "Total Analyses", value: stats.total, icon: "📊" },
    { label: "Misinformation Detected", value: stats.misinformation, icon: "🚫" },
    { label: "Suspicious Content", value: stats.suspicious, icon: "⚠️" },
    { label: "Average Trust Score", value: `${stats.averageScore}`, icon: "✅" },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article key={card.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{card.icon} {card.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Verdict Distribution</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={verdictDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
              >
                {verdictDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Recent Analysis History</h2>
        {analysisHistory.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">
            No analyses yet. Start by analyzing content above.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Modality</th>
                  <th className="px-3 py-2">Trust Score</th>
                  <th className="px-3 py-2">Verdict</th>
                  <th className="px-3 py-2">Language</th>
                </tr>
              </thead>
              <tbody>
                {analysisHistory.map((item, index) => {
                  const rowId = item.id || `${item.time}-${index}`;
                  const isOpen = expandedRow === rowId;
                  return (
                    <Fragment key={rowId}>
                      <tr
                        onClick={() => setExpandedRow(isOpen ? null : rowId)}
                        className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-3 py-2 text-gray-700">{formatTime(item.time)}</td>
                        <td className="px-3 py-2 capitalize text-gray-700">
                          {item.modality}
                        </td>
                        <td className="px-3 py-2 font-semibold text-gray-900">
                          {item.trust_score ?? 0}
                        </td>
                        <td className="px-3 py-2">{item.verdict}</td>
                        <td className="px-3 py-2 uppercase text-gray-700">
                          {item.language || "en"}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <td colSpan={5} className="px-3 py-3 text-xs text-gray-700">
                            <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded bg-white p-3">
                              {JSON.stringify(item.results || item, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Modality Breakdown</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modalityData}>
              <XAxis dataKey="modality" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
