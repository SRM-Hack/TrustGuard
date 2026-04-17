import { createContext, useContext, useMemo, useState } from "react";

const AUTH_KEY = "truthguard_auth_session";
const AuthContext = createContext(null);

function readSession() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(AUTH_KEY) || "null");
    return parsed && parsed.user ? parsed : null;
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const login = ({ email, name }) => {
    const next = {
      user: {
        email,
        name: name || email.split("@")[0],
      },
      loggedInAt: new Date().toISOString(),
    };
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(next));
    setSession(next);
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setSession(null);
  };

  const value = useMemo(
    () => ({
      user: session?.user || null,
      isAuthenticated: Boolean(session?.user),
      login,
      logout,
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
