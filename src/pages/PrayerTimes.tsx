import { ArrowLeft, Compass, Bell, BellOff, MapPin, Loader2, Volume2, RefreshCw, Settings, Calendar, Search, Navigation, ChevronUp, ChevronDown, X, Edit2, Check, Play, Square } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import BottomNav from "@/components/BottomNav";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useAdhanNotification } from "@/hooks/useAdhanNotification";
import { useLanguage } from "@/contexts/LanguageContext";

const CALC_METHODS: { id: number; label: { ar: string; en: string } }[] = [
  { id: 1, label: { ar: "جامعة العلوم الإسلامية - كراتشي", en: "University of Islamic Sciences, Karachi" } },
  { id: 2, label: { ar: "الجمعية الإسلامية لأمريكا الشمالية (ISNA)", en: "ISNA" } },
  { id: 3, label: { ar: "رابطة العالم الإسلامي", en: "Muslim World League" } },
  { id: 4, label: { ar: "أم القرى - مكة المكرمة", en: "Umm Al-Qura, Makkah" } },
  { id: 5, label: { ar: "الهيئة المصرية للمساحة", en: "Egyptian General Authority" } },
  { id: 7, label: { ar: "معهد الجيوفيزياء - جامعة طهران", en: "Institute of Geophysics, Tehran" } },
  { id: 8, label: { ar: "منطقة الخليج", en: "Gulf Region" } },
  { id: 9, label: { ar: "الكويت", en: "Kuwait" } },
  { id: 10, label: { ar: "قطر", en: "Qatar" } },
  { id: 11, label: { ar: "سنغافورة", en: "Singapore" } },
  { id: 12, label: { ar: "فرنسا (UOIF)", en: "France (UOIF)" } },
  { id: 13, label: { ar: "تركيا (ديانت)", en: "Turkey (Diyanet)" } },
  { id: 14, label: { ar: "روسيا", en: "Russia" } },
  { id: 15, label: { ar: "الجزائر", en: "Algeria" } },
];

const POPULAR_CITIES: { name: { ar: string; en: string }; lat: number; lng: number }[] = [
  { name: { ar: "مكة المكرمة", en: "Makkah" }, lat: 21.4225, lng: 39.8262 },
  { name: { ar: "المدينة المنورة", en: "Madinah" }, lat: 24.4672, lng: 39.6112 },
  { name: { ar: "الرياض", en: "Riyadh" }, lat: 24.7136, lng: 46.6753 },
  { name: { ar: "جدة", en: "Jeddah" }, lat: 21.4858, lng: 39.1925 },
  { name: { ar: "القاهرة", en: "Cairo" }, lat: 30.0444, lng: 31.2357 },
  { name: { ar: "الجزائر", en: "Algiers" }, lat: 36.7538, lng: 3.0588 },
  { name: { ar: "الدار البيضاء", en: "Casablanca" }, lat: 33.5731, lng: -7.5898 },
  { name: { ar: "تونس", en: "Tunis" }, lat: 36.8065, lng: 10.1815 },
  { name: { ar: "دبي", en: "Dubai" }, lat: 25.2048, lng: 55.2708 },
  { name: { ar: "أبوظبي", en: "Abu Dhabi" }, lat: 24.4539, lng: 54.3773 },
  { name: { ar: "الكويت", en: "Kuwait" }, lat: 29.3759, lng: 47.9774 },
  { name: { ar: "الدوحة", en: "Doha" }, lat: 25.2854, lng: 51.531 },
  { name: { ar: "المنامة", en: "Manama" }, lat: 26.2285, lng: 50.586 },
  { name: { ar: "مسقط", en: "Muscat" }, lat: 23.5880, lng: 58.3829 },
  { name: { ar: "عمّان", en: "Amman" }, lat: 31.9454, lng: 35.9284 },
  { name: { ar: "بيروت", en: "Beirut" }, lat: 33.8938, lng: 35.5018 },
  { name: { ar: "بغداد", en: "Baghdad" }, lat: 33.3152, lng: 44.3661 },
  { name: { ar: "دمشق", en: "Damascus" }, lat: 33.5138, lng: 36.2765 },
  { name: { ar: "إسطنبول", en: "Istanbul" }, lat: 41.0082, lng: 28.9784 },
  { name: { ar: "جاكرتا", en: "Jakarta" }, lat: -6.2088, lng: 106.8456 },
  { name: { ar: "كوالالمبور", en: "Kuala Lumpur" }, lat: 3.139, lng: 101.6869 },
  { name: { ar: "لندن", en: "London" }, lat: 51.5074, lng: -0.1278 },
  { name: { ar: "باريس", en: "Paris" }, lat: 48.8566, lng: 2.3522 },
  { name: { ar: "نيويورك", en: "New York" }, lat: 40.7128, lng: -74.006 },
];

interface SearchResult {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

const PrayerTimes = () => {
  const { t, isRTL, lang } = useLanguage();
  const {
    prayers, loading, error, city, currentPrayerIndex, nextPrayerTime,
    hijriDate, calculationMethod, setCalculationMethod,
    refreshLocation, setManualLocation, locationSaved, isManualLocation,
    hijriAdjustment, setHijriAdjustment,
  } = usePrayerTimes();

  const [notifications, setNotifications] = useState<Record<number, boolean>>({});
  const [countdown, setCountdown] = useState("--:--:--");
  const [showSettings, setShowSettings] = useState(false);
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [apiResults, setApiResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const [showHijriEdit, setShowHijriEdit] = useState(false);
  const [tempAdjustment, setTempAdjustment] = useState(hijriAdjustment);
  const [showAdhanPicker, setShowAdhanPicker] = useState(false);
  const [playingAdhan, setPlayingAdhan] = useState<string | null>(null);
  const [preAdhanMinutes, setPreAdhanMinutes] = useState<number>(() =>
    parseInt(localStorage.getItem("pre_adhan_minutes") || "0")
  );
  const [iqamaMinutes, setIqamaMinutes] = useState<number>(() =>
    parseInt(localStorage.getItem("iqama_minutes") || "0")
  );
  const preAdhanOptions = [0, 5, 10, 15, 20, 30];
  const iqamaOptions = [0, 5, 10, 15, 20, 30];

  // جلب دوال الأذان من الهوك
  const {
    requestNotificationPermission,
    testAdhan,
    stopAdhan,
    getSelectedAdhanName,
    setSelectedAdhan,
    adhanList,
    audioError,
    isPlaying
  } = useAdhanNotification({ 
    prayers, 
    notifications, 
    preAdhanMinutes, 
    iqamaMinutes 
  });

  // تحديث tempAdjustment عندما يتغير hijriAdjustment
  useEffect(() => {
    setTempAdjustment(hijriAdjustment);
  }, [hijriAdjustment]);

  // تهيئة الإشعارات للصلوات
  useEffect(() => {
    if (prayers.length > 0) {
      setNotifications(Object.fromEntries(prayers.map((_, i) => [i, true])));
    }
  }, [prayers]);

  // طلب إذن الإشعارات
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // عداد الوقت المتبقي للصلاة القادمة
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

  // حساب اتجاه القبلة تم نقله إلى QiblaCompass

  // البحث عن المدن
  const searchCitiesAPI = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setApiResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&accept-language=${lang}&addressdetails=1`
      );
      const data = await res.json();
      const results: SearchResult[] = data.map((item: any) => ({
        name: item.address?.city || item.address?.town || item.address?.village || item.name || query,
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
      setApiResults(results);
    } catch {
      setApiResults([]);
    } finally {
      setSearching(false);
    }
  }, [lang]);

  // تأخير البحث لتجنب الطلبات المتكررة
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (cityQuery.trim().length >= 2) {
      searchTimeout.current = setTimeout(() => searchCitiesAPI(cityQuery), 500);
    } else {
      setApiResults([]);
    }
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [cityQuery, searchCitiesAPI]);

  // تصفية المدن الشائعة حسب البحث
  const filteredCities = cityQuery.trim()
    ? POPULAR_CITIES.filter((c) =>
      c.name[lang].toLowerCase().includes(cityQuery.trim().toLowerCase()) ||
      c.name.ar.includes(cityQuery.trim())
    )
    : POPULAR_CITIES;

  // اختيار مدينة
  const handleSelectCity = useCallback((lat: number, lng: number, name: string) => {
    setManualLocation(lat, lng, name);
    setShowCitySearch(false);
    setCityQuery("");
    setApiResults([]);
  }, [setManualLocation]);

  // تحديد الموقع تلقائياً
  const handleAutoDetect = useCallback(() => {
    refreshLocation();
    setShowCitySearch(false);
    setCityQuery("");
    setApiResults([]);
  }, [refreshLocation]);

  // أسماء الصلوات مترجمة
  const prayerNameMap: Record<string, string> = {
    "الفجر": t("prayer.fajr"),
    "الشروق": t("prayer.sunrise"),
    "الظهر": t("prayer.dhuhr"),
    "العصر": t("prayer.asr"),
    "المغرب": t("prayer.maghrib"),
    "العشاء": t("prayer.isha"),
  };

  // تنسيق التاريخ الهجري مع التعديل
  const formatHijriDate = () => {
    if (!hijriDate) return "";
    const adjustedDay = parseInt(hijriDate.day || "1") + hijriAdjustment;
    return `${hijriDate.weekday} ${adjustedDay} ${hijriDate.month} ${hijriDate.year} هـ`;
  };

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm text-muted-foreground font-cairo">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* الهيدر */}
      <div className="gradient-primary text-primary-foreground px-5 pt-10 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition">
              <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
            </Link>
            <h1 className="text-xl font-bold font-amiri">{t("index.prayer.title")}</h1>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* التاريخ الهجري مع إمكانية التعديل */}
        {hijriDate && (
          <div className="flex items-center gap-2 justify-center mb-1">
            <Calendar size={12} className="opacity-70" />
            <span className="text-xs font-cairo opacity-80">
              {formatHijriDate()}
            </span>
            <button
              onClick={() => { setTempAdjustment(hijriAdjustment); setShowHijriEdit(true); }}
              className="p-1 rounded-full hover:bg-primary-foreground/10 transition"
            >
              <Edit2 size={12} className="opacity-70" />
            </button>
            {hijriAdjustment !== 0 && (
              <span className="text-[10px] opacity-50 font-cairo">
                ({hijriAdjustment > 0 ? `+${hijriAdjustment}` : hijriAdjustment})
              </span>
            )}
          </div>
        )}

        {/* الموقع */}
        <div className="flex items-center gap-1 justify-center mb-2 opacity-70">
          <MapPin size={12} />
          <button
            onClick={() => setShowCitySearch(true)}
            className="text-xs font-cairo underline underline-offset-2 hover:opacity-100 transition"
          >
            {city}
          </button>
          {isManualLocation && (
            <span className="text-[9px] opacity-60 font-cairo">
              ({lang === "ar" ? "يدوي" : "Manual"})
            </span>
          )}
        </div>

        {/* معلومات الصلاة القادمة */}
        {error ? (
          <p className="text-center text-sm opacity-80">{error}</p>
        ) : (
          <div className="text-center">
            <p className="text-sm opacity-80 font-cairo">{t("index.next.prayer")}</p>
            <p className="text-3xl font-bold font-amiri mt-1">
              {prayerNameMap[prayers[(currentPrayerIndex + 1) % prayers.length]?.name] || prayers[(currentPrayerIndex + 1) % prayers.length]?.name}
            </p>
            <p className="text-4xl font-bold font-cairo mt-2">
              {prayers[(currentPrayerIndex + 1) % prayers.length]?.time}
            </p>
            <p className="text-sm opacity-70 mt-1 font-cairo">{t("index.remaining")} {countdown}</p>
          </div>
        )}
      </div>

      {/* نافذة تعديل التاريخ الهجري */}
      {showHijriEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40" onClick={() => setShowHijriEdit(false)}>
          <div className="bg-card rounded-2xl p-6 w-[85%] max-w-sm shadow-xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold font-cairo text-card-foreground mb-4 text-center">
              {lang === "ar" ? "تعديل التاريخ الهجري" : "Adjust Hijri Date"}
            </h3>
            <div className="flex items-center justify-center gap-6 mb-6">
              <button
                onClick={() => setTempAdjustment(tempAdjustment - 1)}
                className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition"
              >
                <ChevronDown size={24} className="text-card-foreground" />
              </button>
              <div className="text-center">
                <p className="text-3xl font-bold font-cairo text-primary">
                  {tempAdjustment > 0 ? `+${tempAdjustment}` : tempAdjustment}
                </p>
                <p className="text-xs text-muted-foreground font-cairo mt-1">
                  {lang === "ar" ? "يوم" : "days"}
                </p>
              </div>
              <button
                onClick={() => setTempAdjustment(tempAdjustment + 1)}
                className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition"
              >
                <ChevronUp size={24} className="text-card-foreground" />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowHijriEdit(false)}
                className="flex-1 py-3 rounded-xl bg-muted text-card-foreground font-cairo font-bold transition hover:bg-muted/80"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => {
                  setHijriAdjustment(tempAdjustment);
                  setShowHijriEdit(false);
                }}
                className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-cairo font-bold transition"
              >
                {t("save")}
              </button>
            </div>
            {tempAdjustment !== 0 && (
              <button
                onClick={() => setTempAdjustment(0)}
                className="w-full mt-2 py-2 text-xs text-muted-foreground font-cairo hover:text-primary transition"
              >
                {lang === "ar" ? "إعادة تعيين" : "Reset"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* نافذة البحث عن مدينة */}
      {showCitySearch && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40" onClick={() => setShowCitySearch(false)}>
          <div
            className="w-full max-w-lg bg-card rounded-t-3xl p-5 max-h-[75vh] flex flex-col animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold font-cairo text-card-foreground">
                {lang === "ar" ? "اختيار المدينة" : "Select City"}
              </h2>
              <button onClick={() => setShowCitySearch(false)} className="p-1 rounded-full hover:bg-muted transition">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <button
              onClick={handleAutoDetect}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition mb-3"
            >
              <Navigation size={18} className="text-primary" />
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="text-sm font-bold font-cairo text-primary">
                  {lang === "ar" ? "تحديد تلقائي (GPS)" : "Auto-detect (GPS)"}
                </p>
                <p className="text-[11px] text-muted-foreground font-cairo">
                  {lang === "ar" ? "استخدام موقعك الحالي" : "Use your current location"}
                </p>
              </div>
            </button>

            <div className="relative mb-3">
              <Search size={16} className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-muted-foreground`} />
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder={lang === "ar" ? "ابحث عن مدينة..." : "Search for a city..."}
                className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 rounded-xl bg-muted text-foreground text-sm font-cairo border border-border focus:outline-none focus:ring-2 focus:ring-primary`}
                autoFocus
              />
            </div>

            {/* نتائج البحث من API */}
            {cityQuery.trim().length >= 2 && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground font-cairo mb-2">
                  {lang === "ar" ? "نتائج البحث" : "Search Results"}
                </p>
                {searching ? (
                  <div className="flex items-center gap-2 justify-center py-4">
                    <Loader2 size={14} className="animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground font-cairo">
                      {lang === "ar" ? "جارٍ البحث..." : "Searching..."}
                    </span>
                  </div>
                ) : apiResults.length > 0 ? (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {apiResults.map((r, idx) => (
                      <button
                        key={`api-${idx}`}
                        onClick={() => handleSelectCity(r.lat, r.lng, r.name)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition ${isRTL ? "text-right" : "text-left"}`}
                      >
                        <Search size={14} className="text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-cairo text-card-foreground block">{r.name}</span>
                          <span className="text-[10px] text-muted-foreground block truncate">{r.displayName}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-muted-foreground font-cairo py-3">
                    {lang === "ar" ? "لا توجد نتائج" : "No results"}
                  </p>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground font-cairo mb-2">
              {lang === "ar" ? "مدن شائعة" : "Popular Cities"}
            </p>
            <div className="overflow-y-auto flex-1 space-y-1">
              {filteredCities.map((c) => (
                <button
                  key={c.name.en}
                  onClick={() => handleSelectCity(c.lat, c.lng, c.name[lang])}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition ${isRTL ? "text-right" : "text-left"} ${city === c.name.ar || city === c.name.en ? "bg-primary/10 border border-primary/20" : ""
                    }`}
                >
                  <MapPin size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-sm font-cairo text-card-foreground">{c.name[lang]}</span>
                  {(city === c.name.ar || city === c.name.en) && (
                    <span className={`text-[10px] text-primary font-cairo ${isRTL ? "mr-auto" : "ml-auto"}`}>
                      ✓ {lang === "ar" ? "الحالية" : "Current"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* لوحة الإعدادات */}
      {showSettings && (
        <div className="px-5 mt-4 animate-fade-up">
          <div className="card-islamic space-y-3">
            <p className="text-sm font-bold font-cairo text-card-foreground">
              {lang === "ar" ? "طريقة الحساب" : "Calculation Method"}
            </p>
            <select
              value={calculationMethod}
              onChange={(e) => setCalculationMethod(Number(e.target.value))}
              className="w-full p-2 rounded-xl bg-muted text-foreground text-sm font-cairo border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CALC_METHODS.map((m) => (
                <option key={m.id} value={m.id}>{m.label[lang]}</option>
              ))}
            </select>

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground font-cairo">
                {locationSaved
                  ? (lang === "ar" ? "✅ الموقع محفوظ محلياً" : "✅ Location saved locally")
                  : (lang === "ar" ? "📍 جارٍ تحديد الموقع..." : "📍 Detecting location...")}
                {isManualLocation && (lang === "ar" ? " (يدوي)" : " (Manual)")}
              </p>
            </div>

            {/* Pre-Adhan reminder */}
            <div className="border-t border-border/40 pt-3">
              <p className="text-sm font-bold font-cairo text-card-foreground mb-2">
                {lang === "ar" ? "⏰ تنبيه قبل الأذان" : "⏰ Pre-Adhan Reminder"}
              </p>
              <p className="text-[11px] text-muted-foreground font-cairo mb-2">
                {lang === "ar" ? "تنبيه قبل موعد الصلاة بعدد دقائق تختارها" : "Alert before the prayer call by selected minutes"}
              </p>
              <div className="flex flex-wrap gap-2">
                {preAdhanOptions.map((min) => (
                  <button
                    key={min}
                    onClick={() => {
                      setPreAdhanMinutes(min);
                      localStorage.setItem("pre_adhan_minutes", String(min));
                      // Reset schedule cache to trigger rescheduling
                      localStorage.removeItem("last_scheduled_date");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-cairo font-bold transition ${
                      preAdhanMinutes === min
                        ? "gradient-primary text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    {min === 0
                      ? (lang === "ar" ? "معطل" : "Off")
                      : (lang === "ar" ? `${min} د` : `${min}m`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Iqama reminder */}
            <div className="border-t border-border/40 pt-3">
              <p className="text-sm font-bold font-cairo text-card-foreground mb-2">
                {lang === "ar" ? "🕌 تنبيه وقت الإقامة" : "🕌 Iqama Reminder"}
              </p>
              <p className="text-[11px] text-muted-foreground font-cairo mb-2">
                {lang === "ar" ? "تنبيه بعد الأذان لمعرفة موعد الإقامة" : "Alert after adhan to mark iqama time"}
              </p>
              <div className="flex flex-wrap gap-2">
                {iqamaOptions.map((min) => (
                  <button
                    key={min}
                    onClick={() => {
                      setIqamaMinutes(min);
                      localStorage.setItem("iqama_minutes", String(min));
                      localStorage.removeItem("last_scheduled_date");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-cairo font-bold transition ${
                      iqamaMinutes === min
                        ? "gradient-primary text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    {min === 0
                      ? (lang === "ar" ? "معطل" : "Off")
                      : (lang === "ar" ? `${min} د` : `${min}m`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="px-5 mt-6 space-y-3">
        {/* اختيار صوت الأذان */}
        <button
          onClick={() => {
            if (!showAdhanPicker) {
              setShowAdhanPicker(true);
            } else {
              setShowAdhanPicker(false);
              if (playingAdhan) {
                stopAdhan();
                setPlayingAdhan(null);
              }
            }
          }}
          className="w-full card-islamic flex items-center gap-3 hover:shadow-md transition-all animate-fade-up group"
        >
          <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center group-hover:scale-110 transition-transform">
            <Volume2 size={20} className="text-secondary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold font-cairo text-card-foreground">
              {lang === "ar" ? "صوت الأذان" : "Adhan Sound"}
            </p>
            <p className="text-[11px] text-muted-foreground font-cairo">
              {showAdhanPicker
                ? (lang === "ar" ? "اختر الأذان المناسب" : "Select adhan sound")
                : (adhanList.find(a => a.name === getSelectedAdhanName())?.label[lang] || adhanList[0].label[lang])
              }
            </p>
          </div>
          {showAdhanPicker && (
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </button>

        {/* نافذة اختيار الأذان المنبثقة */}
        {showAdhanPicker && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40" onClick={() => {
            setShowAdhanPicker(false);
            if (playingAdhan) {
              stopAdhan();
              setPlayingAdhan(null);
            }
          }}>
            <div
              className="w-full max-w-lg bg-card rounded-t-3xl p-5 max-h-[80vh] flex flex-col animate-fade-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold font-cairo text-card-foreground">
                  {lang === "ar" ? "اختر صوت الأذان" : "Select Adhan Sound"}
                </h2>
                <button
                  onClick={() => {
                    setShowAdhanPicker(false);
                    if (playingAdhan) {
                      stopAdhan();
                      setPlayingAdhan(null);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-muted transition"
                >
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              {/* رسالة الخطأ إن وجدت */}
              {audioError && (
                <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-[10px] text-red-500 font-cairo text-center">
                    {audioError}
                  </p>
                </div>
              )}

              {/* قائمة الأذانات */}
              <div className="overflow-y-auto flex-1 space-y-2">
                {adhanList.map((adhan) => {
                  const isSelected = getSelectedAdhanName() === adhan.name;
                  const isCurrentlyPlaying = playingAdhan === adhan.name;

                  return (
                    <div
                      key={adhan.name}
                      className={`flex items-center gap-3 p-3 rounded-xl transition ${isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                        }`}
                    >
                      <button
                        onClick={() => {
                          if (isCurrentlyPlaying) {
                            stopAdhan();
                            setPlayingAdhan(null);
                          } else {
                            // إيقاف أي أذان قيد التشغيل أولاً
                            if (playingAdhan) {
                              stopAdhan();
                            }
                            testAdhan(adhan.name);
                            setPlayingAdhan(adhan.name);
                          }
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition ${isCurrentlyPlaying
                          ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                          }`}
                      >
                        {isCurrentlyPlaying ? <Square size={14} /> : <Play size={14} />}
                      </button>

                      <div className="flex-1">
                        <span className="block text-sm font-cairo text-card-foreground">
                          {adhan.label[lang]}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-cairo">
                          {lang === "ar" ? `المدة: ${adhan.duration} ثانية` : `Duration: ${adhan.duration} seconds`}
                        </span>
                      </div>

                      {isSelected ? (
                        <div className="flex items-center gap-2">
                          <Check size={16} className="text-primary" />
                          <span className="text-[10px] text-primary font-cairo hidden sm:inline">
                            {lang === "ar" ? "مختار" : "Selected"}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedAdhan(adhan.name);
                            // إيقاف التشغيل إذا كان هناك أذان يعمل
                            if (playingAdhan) {
                              stopAdhan();
                              setPlayingAdhan(null);
                            }
                          }}
                          className="text-xs font-cairo text-primary px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition"
                        >
                          {lang === "ar" ? "اختيار" : "Select"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* تذييل */}
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground text-center font-cairo">
                  {lang === "ar"
                    ? "سيتم تشغيل الأذان المختار تلقائياً عند دخول وقت الصلاة"
                    : "Selected adhan will play automatically at prayer time"}
                </p>
              </div>
            </div>
          </div>
        )}


        {/* قائمة الصلوات */}
        <div className="space-y-2">
          {prayers.map((prayer, i) => {
            const isActive = i === currentPrayerIndex;
            const displayName = prayerNameMap[prayer.name] || prayer.name;

            return (
              <div
                key={i}
                className={`card-islamic flex items-center justify-between animate-fade-up ${isActive ? "bg-emerald-light border-primary/30 shadow-md" : ""
                  }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-3">
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
                  )}
                  <div>
                    <p className={`text-sm font-bold font-cairo ${isActive ? "text-primary" : "text-card-foreground"}`}>
                      {displayName}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{prayer.nameEn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-bold font-cairo ${isActive ? "text-primary" : "text-card-foreground"}`}>
                    {prayer.time}
                  </p>
                  <button
                    onClick={() => setNotifications({ ...notifications, [i]: !notifications[i] })}
                    className={`p-1.5 rounded-lg transition ${notifications[i] ? "text-primary" : "text-muted-foreground"
                      }`}
                  >
                    {notifications[i] ? <Bell size={16} /> : <BellOff size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default PrayerTimes;