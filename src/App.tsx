import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { App as CapApp } from "@capacitor/app";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import SplashScreen from "@/components/SplashScreen";
import Index from "./pages/Index";
import ZakatCalculator from "./pages/ZakatCalculator";
import InheritanceCalculator from "./pages/InheritanceCalculator";
import PrayerTimes from "./pages/PrayerTimes";
import Azkar from "./pages/Azkar";
import AzkarDetail from "./pages/AzkarDetail";
import HijriCalendar from "./pages/HijriCalendar";
import Profile from "./pages/Profile";
import Qibla from "./pages/Qibla";
import CalculationHistory from "./pages/CalculationHistory";
import NotFound from "./pages/NotFound";
import { NotificationService } from "@/services/NotificationService";
import { PersistentNotificationManager } from "@/components/PersistentNotificationManager";
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      const path = window.location.pathname;
      if (path === '/' || !canGoBack) {
        setShowExitConfirm(true);
      } else {
        window.history.back();
      }
    });

    return () => {
      backListener.then(l => l.remove());
    };
  }, []);


  return (
    <>
      <PersistentNotificationManager />
      <PWAUpdatePrompt />
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/zakat" element={<ZakatCalculator />} />
        <Route path="/inheritance" element={<InheritanceCalculator />} />
        <Route path="/prayer" element={<PrayerTimes />} />
        <Route path="/azkar" element={<Azkar />} />
        <Route path="/azkar/:categoryId" element={<AzkarDetail />} />
        <Route path="/calendar" element={<HijriCalendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/qibla" element={<Qibla />} />
        <Route path="/history" element={<CalculationHistory />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ConfirmationModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={() => CapApp.exitApp()}
        title={lang === "ar" ? "تأكيد الخروج" : "Exit App"}
        message={lang === "ar" ? "هل أنت متأكد من رغبتك في إغلاق التطبيق؟" : "Are you sure you want to exit the application?"}
        confirmText={lang === "ar" ? "نعم، خروج" : "Yes, Exit"}
        cancelText={lang === "ar" ? "لا، البقاء" : "No, Stay"}
      />
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
