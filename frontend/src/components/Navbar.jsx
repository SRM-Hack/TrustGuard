import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { commonTranslations } from "../locales/translations";
import LanguageSelector from "./LanguageSelector";

function Navbar({ apiStatus = "checking" }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { to: "/analyze/text", label: t("navText", commonTranslations), icon: "📝" },
    { to: "/analyze/image", label: t("navImage", commonTranslations), icon: "🖼️" },
    { to: "/analyze/audio", label: t("navAudio", commonTranslations), icon: "🎙️" },
    { to: "/analyze/video", label: t("navVideo", commonTranslations), icon: "🎬" },
  ];

  const renderLink = (item, mobile = false) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={() => setIsOpen(false)}
      end
      className={({ isActive }) =>
        [
          "inline-flex items-center gap-2 text-sm font-medium transition-all duration-200",
          mobile ? "w-full rounded-xl px-4 py-3" : "px-3 py-1.5 rounded-xl",
          isActive
            ? "text-blue-600 bg-blue-600/10 shadow-[0_2px_8px_rgba(37,99,235,0.4)] font-semibold"
            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50/60",
        ].join(" ")
      }
    >
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[68px] border-b border-white/50 bg-white/65 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.60)] transition-colors duration-200">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full animate-glow-pulse group-hover:bg-blue-500/30 transition-colors" />
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-blue-600 relative z-10"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M12 2.4 4 5.9v6.5c0 5.4 3.4 9.9 8 11.2 4.6-1.3 8-5.8 8-11.2V5.9L12 2.4Zm0 2.2 6 2.6v5.2c0 4.2-2.5 7.9-6 9.1-3.5-1.2-6-4.9-6-9.1V7.2l6-2.6Z"
              />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">
              {t("appName", commonTranslations)}
            </span>
            <span className="glass-blue bg-blue-600/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 uppercase rounded tracking-wider">
              {t("aiBadge", commonTranslations)}
            </span>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => renderLink(item))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <div className="pr-4 border-r border-gray-200/50">
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 pl-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900 leading-none">
                    {user?.name || "Analyst"}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">
                    Verified Agent
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={logout}
                className="btn-secondary !py-1.5 !px-3 !text-xs"
              >
                {t("logout", commonTranslations)}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink
                to="/login"
                className="text-xs font-semibold text-gray-600 hover:text-blue-600 px-3 py-1.5 transition"
              >
                {t("login", commonTranslations)}
              </NavLink>
              <NavLink
                to="/signup"
                className="btn-primary !py-1.5 !px-4 !text-xs shadow-blue-500/20"
              >
                {t("signup", commonTranslations)}
              </NavLink>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                apiStatus === "online"
                  ? "bg-green-500 animate-pulse"
                  : apiStatus === "offline"
                    ? "bg-red-500"
                    : "bg-gray-400"
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-500">
              {apiStatus === "online" ? t("apiOnline", commonTranslations) : apiStatus === "offline" ? t("apiOffline", commonTranslations) : t("checking", commonTranslations)}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-white/60 bg-white/60 p-2 text-gray-700 hover:bg-white/90 md:hidden transition-all"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu with Transition */}
      <div 
        className={`md:hidden absolute top-[68px] inset-x-0 bg-white/95 backdrop-blur-2xl border-t border-white/50 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 border-b border-white/50" : "max-h-0"
        }`}
      >
        <div className="px-4 py-6 space-y-4">
          <div className="flex justify-center pb-2">
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => renderLink(item, true))}
          </nav>
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0) || "A"}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{user?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
                >
                  → {t("logout", commonTranslations)}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-2">
                <NavLink
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition"
                >
                  {t("login", commonTranslations)}
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary text-center !py-3"
                >
                  {t("signup", commonTranslations)}
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
