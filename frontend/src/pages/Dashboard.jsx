import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    ].filter(v => v.value > 0),
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
    { label: "Total Analyses", value: stats.total, icon: "📊", color: "blue" },
    { label: "Misinformation", value: stats.misinformation, icon: "🚫", color: "red" },
    { label: "Suspicious Content", value: stats.suspicious, icon: "⚠️", color: "orange" },
    { label: "Avg Trust Score", value: `${stats.averageScore}/100`, icon: "✅", color: "emerald" },
  ];

  if (analysisHistory.length === 0) {
    return (
      <div className="space-y-10 animate-fade-in pb-20">
        <div className="trust-card p-12 text-center flex flex-col items-center gap-6">
          <span className="text-7xl animate-float-3d">🔍</span>
          <div className="space-y-2">
            <h1 className="font-display font-black text-3xl text-gray-900 tracking-tight">No analyses yet</h1>
            <p className="text-gray-500 font-medium max-w-md mx-auto">
              Your dashboard will come to life once you start analyzing content using the navigation above.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link to="/analyze/text" className="btn-secondary">📝 Text</Link>
            <Link to="/analyze/image" className="btn-secondary">🖼️ Image</Link>
            <Link to="/analyze/audio" className="btn-secondary">🎙️ Audio</Link>
            <Link to="/analyze/video" className="btn-secondary">🎬 Video</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header>
        <h1 className="font-display font-black text-3xl text-gray-900 tracking-tight">Analysis Dashboard</h1>
        <p className="text-gray-500 font-medium mt-1">Your session analysis history and statistics</p>
      </header>

      {/* STATS ROW */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div 
            key={idx} 
            className={`trust-card !p-6 border-b-4 border-${card.color}-500 animate-fade-in-up`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{card.icon}</span>
              <span className={`badge-${card.color} !bg-${card.color}-500/10 uppercase font-black text-[10px]`}>Active Session</span>
            </div>
            <p className="text-3xl font-display font-black text-gray-900">{card.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </section>

      {/* CHARTS ROW */}
      <section className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <div className="xl:col-span-2 trust-card space-y-6">
          <h3 className="font-display font-bold text-gray-900">Verdict Distribution</h3>
          <div className="h-[300px] w-full relative">
            {verdictDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={verdictDistribution}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {verdictDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                      fontWeight: '700'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">No data to display</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-6 pt-2">
            {verdictDistribution.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-3 trust-card space-y-6">
          <h3 className="font-display font-bold text-gray-900">Analyses by Modality</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modalityData}>
                <XAxis 
                  dataKey="modality" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    fontWeight: '700'
                  }} 
                />
                <Bar 
                  dataKey="count" 
                  fill="#2563EB" 
                  radius={[8, 8, 0, 0]} 
                  barSize={40} 
                  label={{ position: 'top', fontSize: 10, fontWeight: 800, fill: '#2563EB' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            {modalityData.map((m, idx) => (
              <div key={idx} className="space-y-1 text-center">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">{m.modality}</p>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(m.count / stats.total) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HISTORY TABLE */}
      <section className="trust-card space-y-6">
        <div>
          <h3 className="font-display font-bold text-gray-900">Recent Analysis History</h3>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">Last 10 analyses from this session</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2 text-center">Trust Score</th>
                <th className="px-4 py-2">Verdict</th>
                <th className="px-4 py-2">Language</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {analysisHistory.map((item, idx) => {
                const score = Number(item.trust_score) || 0;
                const scoreColor = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-orange-600' : 'text-red-600';
                const rowId = item.id || `${item.time}-${idx}`;
                const isExpanded = expandedRow === rowId;

                return (
                  <Fragment key={rowId}>
                    <tr 
                      className={`group cursor-pointer transition-all duration-200 ${isExpanded ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                      onClick={() => setExpandedRow(isExpanded ? null : rowId)}
                    >
                      <td className="px-4 py-4 text-xs font-bold text-gray-500 rounded-l-xl">{formatTime(item.time)}</td>
                      <td className="px-4 py-4">
                        <span className={`badge-blue !bg-white border border-blue-100 !text-blue-600 uppercase text-[10px] font-black`}>
                          {item.modality}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-display font-black text-lg ${scoreColor}`}>{score}</span>
                        <span className="text-[10px] font-bold text-gray-300 ml-0.5">/100</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`badge-${item.verdict === 'TRUSTED' ? 'green' : item.verdict === 'SUSPICIOUS' ? 'orange' : 'red'} text-[10px] font-black uppercase`}>
                          {item.verdict}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-gray-600 uppercase">{item.language || 'en'}</td>
                      <td className="px-4 py-4 text-right rounded-r-xl">
                        <span className={`inline-block transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="px-4 pb-4 animate-fade-in">
                          <div className="bg-gray-950 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-white font-black text-4xl pointer-events-none">JSON</div>
                            <pre className="text-[11px] font-mono text-blue-300 overflow-x-auto custom-scrollbar">
                              {JSON.stringify(item.results || item, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
