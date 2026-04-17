import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { landingTranslations, landingSectionsTranslations } from "../locales/translations";

function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const features = [
    {
      title: t("feature1Title", landingSectionsTranslations),
      description: t("feature1Desc", landingSectionsTranslations),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "blue",
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      title: t("feature2Title", landingSectionsTranslations),
      description: t("feature2Desc", landingSectionsTranslations),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: "purple",
      gradient: "from-purple-600 to-indigo-600",
    },
    {
      title: t("feature3Title", landingSectionsTranslations),
      description: t("feature3Desc", landingSectionsTranslations),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      color: "green",
      gradient: "from-emerald-600 to-teal-600",
    },
  ];

  const modalities = [
    {
      title: t("modalityText", landingSectionsTranslations),
      description: t("modalityTextDesc", landingSectionsTranslations),
      icon: "📝",
      color: "green",
      path: "/analyze/text",
    },
    {
      title: t("modalityImage", landingSectionsTranslations),
      description: t("modalityImageDesc", landingSectionsTranslations),
      icon: "🖼️",
      color: "blue",
      path: "/analyze/image",
    },
    {
      title: t("modalityAudio", landingSectionsTranslations),
      description: t("modalityAudioDesc", landingSectionsTranslations),
      icon: "🎙️",
      color: "purple",
      path: "/analyze/audio",
    },
    {
      title: t("modalityVideo", landingSectionsTranslations),
      description: t("modalityVideoDesc", landingSectionsTranslations),
      icon: "🎬",
      color: "red",
      path: "/analyze/video",
    },
  ];

  const steps = [
    { n: "1", icon: "📥", label: t("step1Label", landingSectionsTranslations), desc: t("step1Desc", landingSectionsTranslations) },
    { n: "2", icon: "🔍", label: t("step2Label", landingSectionsTranslations), desc: t("step2Desc", landingSectionsTranslations) },
    { n: "3", icon: "✅", label: t("step3Label", landingSectionsTranslations), desc: t("step3Desc", landingSectionsTranslations) },
    { n: "4", icon: "💡", label: t("step4Label", landingSectionsTranslations), desc: t("step4Desc", landingSectionsTranslations) },
  ];

  const stats = [
    { icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ), value: "4", label: t("statsModalities", landingTranslations), color: "border-blue-500" },
    { icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ), value: "3", label: t("statsLanguages", landingTranslations), color: "border-indigo-500" },
    { icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ), value: "6", label: t("statsModels", landingTranslations), color: "border-purple-500" },
    { icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ), value: "100%", label: t("statsExplainable", landingTranslations), color: "border-emerald-500" },
  ];

  return (
    <div className="animate-fade-in space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 px-8 py-20 sm:px-16 sm:py-28 min-h-[600px] flex items-center shadow-2xl">
        {/* 3D Floating Grid Mesh */}
        <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.1"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" transform="perspective(100px) rotateX(45deg) scale(2) translateY(-20%)" />
          </svg>
        </div>

        {/* Ambient Glow Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/25 blur-[120px] rounded-full animate-blob pointer-events-none" />
        <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-indigo-600/20 blur-[100px] rounded-full animate-blob pointer-events-none animation-delay-2000" />
        <div className="absolute bottom-[-15%] left-[30%] w-[350px] h-[350px] bg-emerald-600/12 blur-[80px] rounded-full animate-blob pointer-events-none animation-delay-4000" />

        <div className="relative z-10 grid gap-12 xl:grid-cols-2 items-center w-full max-w-7xl mx-auto">
          {/* Left Column Content */}
          <div className="space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-blue-300 animate-fade-in-up">
              {t("heroBadge", landingTranslations)}
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold font-display leading-[1.1] text-white animate-fade-in-up animation-delay-200">
              {t("heroH1", landingTranslations)} <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">
                {t("heroH1Span", landingTranslations)}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-200/75 leading-relaxed animate-fade-in-up animation-delay-500">
              {t("heroSub", landingTranslations)}
            </p>
            <div className="flex flex-wrap gap-4 pt-4 animate-fade-in-up animation-delay-700">
              <Link to={isAuthenticated ? "/analyze/text" : "/login"} className="btn-primary flex items-center gap-2 group">
                {isAuthenticated ? t("openWorkspace", landingTranslations) : t("getStarted", landingTranslations)}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              {!isAuthenticated && (
                <Link to="/signup" className="btn-secondary !bg-transparent !border-white/20 !text-white hover:!bg-white/5">
                  {t("learnMore", landingTranslations)}
                </Link>
              )}
            </div>
          </div>

          {/* Right Column Content (Result Card) */}
          <div className="hidden xl:flex justify-center relative">
            <div className="absolute inset-0 bg-blue-500/15 blur-[60px] rounded-[3rem] animate-glow-pulse" />
            
            {/* Rotating Ring Orbit */}
            <div className="absolute inset-[-40px] border-[1.5px] border-white/10 rounded-full animate-spin-slow pointer-events-none" />
            <div className="absolute inset-[-20px] border border-white/5 rounded-full animate-spin-slow pointer-events-none animation-delay-2000" />

            <div className="glass-dark w-[380px] p-8 space-y-6 relative z-20 animate-float-3d shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-white/60 text-sm font-medium">Result Overview</span>
                <span className="badge-blue !bg-blue-500/20 !border-blue-500/30 !text-blue-300">AI Verified</span>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Trust Score</span>
                  <span className="text-3xl font-bold text-emerald-400 font-display">73</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Verdict</span>
                  <span className="glass-blue px-3 py-1 text-sm font-bold text-emerald-300 border-emerald-500/30">
                    ✅ TRUSTED
                  </span>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>Language</span>
                    <span className="text-white/90">हिन्दी (Hindi)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>Modules Used</span>
                    <span className="text-white/90">Text · Fact Check · LLM</span>
                  </div>
                </div>

                <div className="progress-bar-3d">
                  <div className="progress-bar-3d-fill w-[73%] text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS ROW */}
      <section className="grid grid-cols-2 gap-6 sm:grid-cols-4 px-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`trust-card text-center border-b-4 ${stat.color} animate-fade-in-up`} style={{ animationDelay: `${idx * 150}ms` }}>
            <div className="flex justify-center mb-3 text-blue-600/60">{stat.icon}</div>
            <p className="text-4xl font-bold text-truthguard-blue font-display">{stat.value}</p>
            <p className="mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* FEATURES SECTION */}
      <section className="px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-display text-gray-900">{t("featuresTitle", landingSectionsTranslations)}</h2>
          <p className="text-gray-500 mt-2">{t("featuresSub", landingSectionsTranslations)}</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((item, index) => (
            <article key={item.title} className={`trust-card-hover space-y-5 border-l-4 ${item.color === 'blue' ? 'border-blue-500' : item.color === 'purple' ? 'border-purple-500' : 'border-emerald-500'} group`}>
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg shadow-blue-200 transition-transform group-hover:scale-110`}>
                {item.icon}
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-xl text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="px-4 max-w-6xl mx-auto">
        <div className="trust-card !p-12 overflow-hidden relative">
          <div className="relative z-10 text-center mb-12">
            <h2 className="text-2xl font-bold font-display text-gray-900">{t("pipelineTitle", landingSectionsTranslations)}</h2>
            <p className="text-gray-500 mt-1">{t("pipelineSub", landingSectionsTranslations)}</p>
          </div>

          <div className="relative flex flex-col gap-12 md:flex-row md:items-start md:justify-between px-4">
            {/* Animated Connector Line */}
            <div className="absolute top-[40px] left-0 w-full hidden md:block px-24">
              <svg className="w-full h-2" fill="none">
                <line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-blue-200" />
                <circle r="4" fill="#2563EB" className="animate-[move-dot_4s_linear_infinite]" />
              </svg>
            </div>

            {steps.map((step, idx) => (
              <div key={step.n} className="flex flex-col items-center text-center gap-4 relative z-10 md:flex-1">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl shadow-xl shadow-blue-200 border-4 border-white">
                  <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600 shadow-md">
                    {step.n}
                  </span>
                  {step.icon}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{step.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODALITIES SECTION (NEW) */}
      <section className="px-4 pb-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-display text-gray-900">{t("modalitiesTitle", landingSectionsTranslations)}</h2>
          <p className="text-gray-500 mt-2">{t("modalitiesSub", landingSectionsTranslations)}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {modalities.map((mod) => (
            <Link 
              key={mod.path} 
              to={mod.path}
              className={`glass-dark p-8 group border-transparent hover:border-truthguard-${mod.color} transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-125 transition-transform`}>
                {mod.icon}
              </div>
              <div className="relative z-10 space-y-4">
                <span className="text-3xl">{mod.icon}</span>
                <h3 className="text-xl font-bold text-white font-display">{mod.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {mod.description}
                </p>
                <div className="pt-2">
                  <span className={`text-xs font-bold text-truthguard-${mod.color} uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity`}>
                    {t("analyzeNow", landingSectionsTranslations)} →
                  </span>
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 h-1 w-0 bg-truthguard-${mod.color} group-hover:w-full transition-all duration-500 shadow-[0_0_15px_rgba(var(--color-rgb),0.5)]`} />
            </Link>
          ))}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes move-dot {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        svg circle {
          offset-path: path('M 0 1 L 1000 1');
        }
      `}} />
    </div>
  );
}

export default LandingPage;
