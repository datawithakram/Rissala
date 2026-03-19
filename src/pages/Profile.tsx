import { ArrowLeft, User, Globe, Bell, History, ChevronLeft, ChevronRight, Moon, Sun, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";
import { NotificationService } from "@/services/NotificationService";
import { Capacitor } from "@capacitor/core";
import BatteryOptimization from "@/lib/BatteryOptimization";

const Profile = () => {
  const { isDark, toggle } = useTheme();
  const { lang, setLang, t, isRTL } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem("notifications_enabled");
    if (saved === null) return true;
    return saved === "true";
  });
  const [backgroundEnabled, setBackgroundEnabled] = useState(false);

  useEffect(() => {
    localStorage.setItem("notifications_enabled", String(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    const checkBackgroundStatus = async () => {
      if (Capacitor.getPlatform() === 'android') {
        try {
          const { isIgnoring } = await BatteryOptimization.isIgnoringBatteryOptimizations();
          setBackgroundEnabled(isIgnoring);
        } catch (e) {
          console.error("Battery optimization check failed", e);
        }
      }
    };
    checkBackgroundStatus();
  }, []);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      if (Capacitor.getPlatform() !== 'web') {
        // On native: just enable
        setNotificationsEnabled(true);
      } else {
        if ("Notification" in window) {
          const perm = await Notification.requestPermission();
          if (perm === "granted") {
            setNotificationsEnabled(true);
          } else {
            setNotificationsEnabled(false);
          }
        } else {
          setNotificationsEnabled(true);
        }
      }
    } else {
      setNotificationsEnabled(false);
      // Stop the persistent notification service
      if (Capacitor.getPlatform() !== 'web') {
        NotificationService.stopPersistentNotification();
      }
    }
  };

  const handleBackgroundToggle = async () => {
    if (Capacitor.getPlatform() === 'android') {
      try {
        await BatteryOptimization.requestIgnoreBatteryOptimizations();
        // Check again after a delay as the intent might take time or open settings
        setTimeout(async () => {
          const { isIgnoring } = await BatteryOptimization.isIgnoringBatteryOptimizations();
          setBackgroundEnabled(isIgnoring);
        }, 5000);
      } catch (e) {
        console.error("Failed to request background optimizations", e);
      }
    } else {
      setBackgroundEnabled(!backgroundEnabled);
    }
  };

  const toggleLanguage = () => {
    setLang(lang === "ar" ? "en" : "ar");
  };

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-primary text-primary-foreground px-5 pt-10 pb-10 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition">
            <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          </Link>
          <h1 className="text-xl font-bold font-amiri">{t("profile.title")}</h1>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center border-2 border-primary-foreground/30">
            <User size={36} className="opacity-80" />
          </div>
          <p className="text-lg font-bold font-cairo mt-3">{t("profile.user")}</p>
          <p className="text-sm opacity-70 font-cairo">{t("profile.welcome")}</p>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-2">
        {/* Dark Mode Toggle */}
        <div className="w-full card-islamic flex items-center justify-between hover:shadow-md transition-all animate-fade-up group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-light flex items-center justify-center group-hover:scale-110 transition-transform">
              {isDark ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
            </div>
            <div>
              <p className="text-sm font-bold font-cairo text-card-foreground">{t("profile.appearance")}</p>
              <p className="text-[11px] text-muted-foreground font-cairo">{isDark ? t("profile.dark") : t("profile.light")}</p>
            </div>
          </div>
          <Switch checked={isDark} onCheckedChange={toggle} />
        </div>

        {/* Calculation History */}
        <Link
          to="/history"
          className="w-full card-islamic flex items-center justify-between hover:shadow-md transition-all animate-fade-up group"
          style={{ animationDelay: "60ms" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-light flex items-center justify-center group-hover:scale-110 transition-transform">
              <History size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold font-cairo text-card-foreground">{t("profile.history")}</p>
              <p className="text-[11px] text-muted-foreground font-cairo">{t("profile.history.sub")}</p>
            </div>
          </div>
          <Chevron size={16} className="text-muted-foreground" />
        </Link>

        {/* Language */}
        <button
          onClick={toggleLanguage}
          className="w-full card-islamic flex items-center justify-between hover:shadow-md transition-all animate-fade-up group"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-light flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold font-cairo text-card-foreground">{t("profile.language")}</p>
              <p className="text-[11px] text-muted-foreground font-cairo">{t("profile.language.current")}</p>
            </div>
          </div>
          <Chevron size={16} className="text-muted-foreground" />
        </button>

        {/* Notifications */}
        <div
          className="w-full card-islamic flex items-center justify-between hover:shadow-md transition-all animate-fade-up group"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-light flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold font-cairo text-card-foreground">{t("profile.notifications")}</p>
              <p className="text-[11px] text-muted-foreground font-cairo">
                {notificationsEnabled ? t("profile.notifications.on") : t("profile.notifications.off")}
              </p>
            </div>
          </div>
          <Switch checked={notificationsEnabled} onCheckedChange={handleNotificationToggle} />
        </div>

        {/* Background Execution */}
        {(Capacitor.getPlatform() === 'android' || process.env.NODE_ENV === 'development') && (
          <div
            className="w-full card-islamic flex items-center justify-between hover:shadow-md transition-all animate-fade-up group"
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-light flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold font-cairo text-card-foreground">{t("profile.background")}</p>
                <p className="text-[11px] text-muted-foreground font-cairo">
                  {t("profile.background.desc")}
                </p>
              </div>
            </div>
            <Switch checked={backgroundEnabled} onCheckedChange={handleBackgroundToggle} />
          </div>
        )}
      </div>

      <div className="px-5 mt-8 animate-fade-up" style={{ animationDelay: "300ms" }}>
        <div className="card-islamic bg-emerald-light border-primary/20 text-center">
          <p className="text-sm font-amiri text-primary leading-relaxed">
            {t("verse.profile")}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 font-cairo">{t("verse.profile.source")}</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
