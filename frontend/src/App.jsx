import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { checkHealth } from "./api/truthguard";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AudioAnalysis from "./pages/AudioAnalysis";
import Dashboard from "./pages/Dashboard";
import ImageAnalysis from "./pages/ImageAnalysis";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TextAnalysis from "./pages/TextAnalysis";
import VideoAnalysis from "./pages/VideoAnalysis";

function AppShell() {
  const [apiStatus, setApiStatus] = useState("checking");
  const [offlineDismissed, setOfflineDismissed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const pollHealth = async () => {
      try {
        const response = await checkHealth();
        const isHealthy =
          response?.status === "ok" || response?.status === "healthy";
        if (mounted) {
          setApiStatus(isHealthy ? "online" : "offline");
          if (isHealthy) {
            setOfflineDismissed(false);
          }
        }
      } catch (error) {
        if (mounted) {
          setApiStatus("offline");
        }
      }
    };

    pollHealth();
    const intervalId = setInterval(pollHealth, 30000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const statusClass =
    apiStatus === "online"
      ? "border border-green-200 bg-green-50 text-green-700"
      : apiStatus === "offline"
        ? "border border-red-200 bg-red-50 text-red-700"
        : "border border-gray-200 bg-gray-50 text-gray-600";

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="bg-blob bg-blob-slow absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/40" />
          <div className="bg-blob absolute top-16 -right-24 h-72 w-72 rounded-full bg-indigo-500/35" />
          <div className="bg-blob bg-blob-slow absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-green-400/20" />
        </div>
        <Navbar apiStatus={apiStatus} />
        {apiStatus === "offline" && !offlineDismissed && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-800">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
              <span>
                ⚠️ Backend server is offline. Start it with: cd backend && python
                main.py
              </span>
              <button
                type="button"
                onClick={() => setOfflineDismissed(true)}
                className="text-base leading-none text-amber-700 hover:text-amber-900"
                aria-label="Dismiss backend offline warning"
              >
                ×
              </button>
            </div>
          </div>
        )}
        <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/analyze/text"
              element={
                <ProtectedRoute>
                  <TextAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analyze/image"
              element={
                <ProtectedRoute>
                  <ImageAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analyze/audio"
              element={
                <ProtectedRoute>
                  <AudioAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analyze/video"
              element={
                <ProtectedRoute>
                  <VideoAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
        <Footer />
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-md ${statusClass}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                apiStatus === "online"
                  ? "bg-green-500 animate-pulse"
                  : apiStatus === "offline"
                    ? "bg-red-500"
                    : "bg-gray-400"
              }`}
            />
            <span>
              {apiStatus === "online"
                ? "API Online"
                : apiStatus === "offline"
                  ? "API Offline"
                  : "Checking API..."}
            </span>
          </div>
        </div>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return <AppShell />;
}

export default App;
