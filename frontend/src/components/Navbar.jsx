import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/analyze/text", label: "Text Analysis", icon: "📝" },
  { to: "/analyze/image", label: "Image Analysis", icon: "🖼️" },
  { to: "/analyze/audio", label: "Audio Analysis", icon: "🎙️" },
  { to: "/analyze/video", label: "Video Analysis", icon: "🎬" },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const renderLink = (item, mobile = false) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={() => setIsOpen(false)}
      end
      className={({ isActive }) =>
        [
          "inline-flex items-center gap-2 text-sm font-medium transition-colors",
          mobile ? "w-full rounded-lg px-3 py-2" : "h-16 px-2",
          isActive
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-600 hover:text-blue-600 border-b-2 border-transparent",
        ].join(" ")
      }
    >
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 text-blue-600"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M12 2.4 4 5.9v6.5c0 5.4 3.4 9.9 8 11.2 4.6-1.3 8-5.8 8-11.2V5.9L12 2.4Zm0 2.2 6 2.6v5.2c0 4.2-2.5 7.9-6 9.1-3.5-1.2-6-4.9-6-9.1V7.2l6-2.6Z"
            />
          </svg>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">TruthGuard</span>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              AI
            </span>
          </div>
        </NavLink>

        <nav className="hidden h-16 items-center gap-4 md:flex">
          {navItems.map((item) => renderLink(item))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className="text-xs font-medium text-gray-500 hover:text-blue-600"
              >
                Dashboard
              </NavLink>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {user?.name || "Analyst"}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-xs font-medium text-gray-500 hover:text-blue-600"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7h16M4 12h16M4 17h16"
              />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => renderLink(item, true))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-medium text-gray-600"
                >
                  Dashboard
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="text-left text-xs font-semibold text-gray-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-medium text-gray-600"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-semibold text-blue-700"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
