import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { commonTranslations } from "../locales/translations";

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative mt-auto w-full border-t border-white/10 bg-gradient-to-r from-slate-900/95 via-blue-950/90 to-slate-900/95 backdrop-blur-xl py-12 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 text-white">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.4 4 5.9v6.5c0 5.4 3.4 9.9 8 11.2 4.6-1.3 8-5.8 8-11.2V5.9L12 2.4Z" />
                </svg>
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                {t("appName", commonTranslations)}
              </span>
            </div>
            <p className="text-blue-300/70 text-sm font-medium leading-relaxed">
              {t("footerMission", commonTranslations)}
            </p>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest pt-2">
              CodeWizards 2.0 · SRMIST Delhi-NCR
            </p>
          </div>

          {/* CENTER COLUMN */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
              {t("quickLinks", commonTranslations)}
            </h4>
            <nav className="grid grid-cols-2 gap-y-3 gap-x-4">
              <Link to="/analyze/text" className="text-sm text-white/60 hover:text-blue-300 transition-colors font-medium">{t("navText", commonTranslations)}</Link>
              <Link to="/analyze/image" className="text-sm text-white/60 hover:text-blue-300 transition-colors font-medium">{t("navImage", commonTranslations)}</Link>
              <Link to="/analyze/audio" className="text-sm text-white/60 hover:text-blue-300 transition-colors font-medium">{t("navAudio", commonTranslations)}</Link>
              <Link to="/analyze/video" className="text-sm text-white/60 hover:text-blue-300 transition-colors font-medium">{t("navVideo", commonTranslations)}</Link>
              <Link to="/dashboard" className="text-sm text-white/60 hover:text-blue-300 transition-colors font-medium">{t("navDashboard", commonTranslations)}</Link>
            </nav>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
              {t("builtFor", commonTranslations)}
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-white/70 font-bold">{t("hackathon", commonTranslations)}</p>
              <p className="text-xs text-white/40 font-medium">Problem Statement #5: AI in Governance & Truth</p>
              <div className="pt-2 flex items-center gap-2 text-white/40">
                <span className="text-lg">📍</span>
                <span className="text-xs font-bold uppercase tracking-tighter">April 17–18, 2026 · Ghaziabad</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 font-medium order-2 sm:order-1">
            © 2026 TruthGuard. Built with ❤️ and AI for a safer digital world.
          </p>
          <div className="flex items-center gap-6 order-1 sm:order-2">
            <a href="#" className="text-white/30 hover:text-white/60 text-xs font-bold transition-colors uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-white/30 hover:text-white/60 text-xs font-bold transition-colors uppercase tracking-widest">Terms</a>
            <a href="#" className="text-white/30 hover:text-white/60 text-xs font-bold transition-colors uppercase tracking-widest">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
