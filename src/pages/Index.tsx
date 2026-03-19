import { Link } from "react-router-dom";
import { Calculator, Scale, Clock, BookOpen, Calendar, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { prayers, loading, currentPrayerIndex, nextPrayerTime, hijriDate } = usePrayerTimes();
  const { t, isRTL } = useLanguage();
  const [countdown, setCountdown] = useState("--:--:--");

  const modules = [
    { title: t("index.zakat.title"), subtitle: "Zakat Calculator", icon: Calculator, path: "/zakat", gradient: "from-primary to-emerald-dark" },
    { title: t("index.inheritance.title"), subtitle: "Inheritance", icon: Scale, path: "/inheritance", gradient: "from-navy to-accent" },
    { title: t("index.prayer.title"), subtitle: "Prayer Times", icon: Clock, path: "/prayer", gradient: "from-gold-dark to-secondary" },
    { title: t("index.azkar.title"), subtitle: "Azkar", icon: BookOpen, path: "/azkar", gradient: "from-primary to-navy" },
    { title: t("index.calendar.title"), subtitle: "Hijri Calendar", icon: Calendar, path: "/calendar", gradient: "from-accent to-navy" },
  ];

  const todayGregorian = new Date().toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", calendar: "gregory",
  });

  useEffect(() => {
    if (!nextPrayerTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      let diff = nextPrayerTime.getTime() - now.getTime();
      if (diff < 0) diff += 24 * 60 * 60 * 1000;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextPrayerTime]);

  const prayerNameMap: Record<string, string> = {
    "الفجر": t("prayer.fajr"),
    "الشروق": t("prayer.sunrise"),
    "الظهر": t("prayer.dhuhr"),
    "العصر": t("prayer.asr"),
    "المغرب": t("prayer.maghrib"),
    "العشاء": t("prayer.isha"),
  };
  const nextPrayer = prayers.length > 0 ? prayers[(currentPrayerIndex + 1) % prayers.length] : null;

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-24">
      <div className="gradient-primary text-primary-foreground px-6 pt-10 pb-8 rounded-b-3xl shadow-lg">
        <p className="text-sm opacity-80 font-cairo">{t("index.greeting")}</p>
        <h1 className="text-2xl font-bold font-amiri mt-1">{t("app.name")}</h1>
        <div className="mt-3 flex items-center gap-2 text-sm opacity-90">
          <Calendar size={14} />
          {hijriDate ? (
            <span className="font-cairo">{hijriDate.weekday} {hijriDate.day} {hijriDate.month} {hijriDate.year} هـ</span>
          ) : (
            <span className="font-cairo">...</span>
          )}
        </div>
        <p className="text-xs opacity-60 mt-1 font-cairo">{todayGregorian}</p>
      </div>

      <div className="mx-5 -mt-5 card-islamic flex items-center justify-between animate-fade-up">
        {loading || !nextPrayer ? (
          <div className="flex items-center gap-2 w-full justify-center py-2">
            <Loader2 size={16} className="animate-spin text-primary" />
            <span className="text-xs text-muted-foreground font-cairo">{t("loading")}</span>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs text-muted-foreground">{t("index.next.prayer")}</p>
              <p className="text-lg font-bold text-primary font-amiri">{prayerNameMap[nextPrayer.name] || nextPrayer.name}</p>
              <p className="text-xs text-muted-foreground">{nextPrayer.time}</p>
            </div>
            <div className={isRTL ? "text-left" : "text-right"}>
              <p className="text-xs text-muted-foreground">{t("index.remaining")}</p>
              <p className="text-2xl font-bold text-gold font-cairo">{countdown}</p>
            </div>
          </>
        )}
      </div>

      <div className="px-5 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 font-cairo">{t("index.services")}</h2>
        <div className="grid grid-cols-2 gap-3">
          {modules.map((mod, i) => (
            <Link key={mod.path} to={mod.path} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="card-islamic hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <mod.icon size={20} className="text-primary-foreground" />
                </div>
                <p className="font-bold text-sm font-cairo text-card-foreground">{mod.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{mod.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-5 mt-6 animate-fade-up" style={{ animationDelay: "400ms" }}>
        <div className="card-islamic bg-emerald-light border-primary/20">
          <p className="text-xs text-primary font-semibold mb-2 font-cairo">{t("index.verse")}</p>
          <p className="text-base font-amiri leading-relaxed text-card-foreground">{t("verse.text")}</p>
          <p className="text-xs text-muted-foreground mt-2 font-cairo">{t("verse.source")}</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
