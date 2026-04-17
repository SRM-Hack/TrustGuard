import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { checkHealth } from "./api/truthguard";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
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
  const [showBackToTop, setShowBackToTop] = useState(false);

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

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen relative overflow-hidden flex flex-col">
        {/* Animated Background Blobs */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="bg-blob bg-blob-slow absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/40" />
          <div className="bg-blob absolute top-16 -right-24 h-72 w-72 rounded-full bg-indigo-500/35" />
          <div className="bg-blob bg-blob-slow absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-green-400/20" />
        </div>

        <Navbar apiStatus={apiStatus} />
        
        {apiStatus === "offline" && !offlineDismissed && (
          <div className="fixed top-[68px] inset-x-0 z-40 border-b border-amber-200 bg-amber-50/90 backdrop-blur-md px-4 py-2.5 text-center text-sm text-amber-800 animate-fade-in">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 font-medium">
              <span>
                ⚠️ Backend server is offline. Please ensure the API is running.
              </span>
              <button
                type="button"
                onClick={() => setOfflineDismissed(true)}
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-amber-100 transition-colors text-lg"
                aria-label="Dismiss backend offline warning"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <main 
          className="mx-auto w-full max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8 min-h-[calc(100vh-68px)] flex-grow"
          style={{ perspective: '2000px' }}
        >
          <div className="animate-fade-in-up">
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
          </div>
        </main>

        <Footer />

        {/* Back to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-card border border-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 ${
            showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
          }`}
          aria-label="Back to top"
        >
          <span className="text-blue-600 font-bold text-lg">↑</span>
        </button>

        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '16px',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
              fontSize: '14px',
              fontWeight: '500',
            }
          }}
        />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
