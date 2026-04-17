import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
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

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
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
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
