import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Lang = "ar" | "en";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<string, Record<Lang, string>> = {
  // General
  "app.name": { ar: "الرسالة", en: "Al Risala" },
  "home": { ar: "الرئيسية", en: "Home" },
  "zakat": { ar: "الزكاة", en: "Zakat" },
  "prayer": { ar: "الصلاة", en: "Prayer" },
  "qibla": { ar: "القبلة", en: "Qibla" },
  "azkar": { ar: "الأذكار", en: "Azkar" },
  "profile": { ar: "الملف", en: "Profile" },
  "back": { ar: "رجوع", en: "Back" },
  "settings": { ar: "الإعدادات", en: "Settings" },
  "save": { ar: "حفظ", en: "Save" },
  "cancel": { ar: "إلغاء", en: "Cancel" },
  "loading": { ar: "جارٍ التحميل...", en: "Loading..." },
  "no.data": { ar: "لا توجد بيانات", en: "No data" },
  
  // Profile
  "profile.title": { ar: "الملف الشخصي", en: "Profile" },
  "profile.user": { ar: "مستخدم", en: "User" },
  "profile.welcome": { ar: "مرحباً بك في الرسالة", en: "Welcome to Al Risala" },
  "profile.appearance": { ar: "المظهر", en: "Appearance" },
  "profile.dark": { ar: "داكن", en: "Dark" },
  "profile.light": { ar: "فاتح", en: "Light" },
  "profile.history": { ar: "سجل الحسابات", en: "Calculation History" },
  "profile.history.sub": { ar: "الزكاة والميراث", en: "Zakat & Inheritance" },
  "profile.language": { ar: "اللغة", en: "Language" },
  "profile.language.current": { ar: "العربية", en: "English" },
  "profile.notifications": { ar: "الإشعارات", en: "Notifications" },
  "profile.notifications.on": { ar: "مفعّلة", en: "Enabled" },
  "profile.notifications.off": { ar: "معطّلة", en: "Disabled" },
  "profile.background": { ar: "العمل في الخلفية", en: "Run in Background" },
  "profile.background.desc": { ar: "استمرار عمل التطبيق في الخلفية دائماً", en: "Allow app to always run in background" },
  
  // History
  "history.title": { ar: "سجل الحسابات", en: "Calculation History" },
  "history.empty": { ar: "لا توجد حسابات سابقة", en: "No previous calculations" },
  "history.empty.desc": { ar: "ستظهر هنا حساباتك للزكاة والميراث بعد إجرائها", en: "Your Zakat and Inheritance calculations will appear here" },
  "history.zakat": { ar: "حساب زكاة", en: "Zakat Calculation" },
  "history.inheritance": { ar: "حساب ميراث", en: "Inheritance Calculation" },
  "history.amount": { ar: "المبلغ", en: "Amount" },
  "history.result": { ar: "النتيجة", en: "Result" },
  "history.date": { ar: "التاريخ", en: "Date" },
  "history.clear": { ar: "مسح السجل", en: "Clear History" },
  
  // Index
  "index.greeting": { ar: "السلام عليكم", en: "Assalamu Alaikum" },
  "index.services": { ar: "الخدمات", en: "Services" },
  "index.next.prayer": { ar: "الصلاة القادمة", en: "Next Prayer" },
  "index.remaining": { ar: "متبقي", en: "Remaining" },
  "index.verse": { ar: "آية اليوم", en: "Verse of the Day" },
  "index.zakat.title": { ar: "حاسبة الزكاة", en: "Zakat Calculator" },
  "index.inheritance.title": { ar: "حاسبة الميراث", en: "Inheritance Calculator" },
  "index.prayer.title": { ar: "أوقات الصلاة", en: "Prayer Times" },
  "index.azkar.title": { ar: "الأذكار", en: "Azkar" },
  "index.calendar.title": { ar: "التقويم الهجري", en: "Hijri Calendar" },
  "index.qibla.title": { ar: "اتجاه القبلة", en: "Qibla Direction" },
  
  // Azkar
  "azkar.title": { ar: "الأذكار", en: "Azkar" },
  "azkar.tasbeeh": { ar: "المسبحة الإلكترونية", en: "Digital Tasbeeh" },
  "azkar.morning": { ar: "أذكار الصباح", en: "Morning Azkar" },
  "azkar.evening": { ar: "أذكار المساء", en: "Evening Azkar" },
  "azkar.sleep": { ar: "أذكار النوم", en: "Sleep Azkar" },
  "azkar.wakeup": { ar: "أذكار الاستيقاظ", en: "Waking Up Azkar" },
  "azkar.afterprayer": { ar: "أذكار بعد الصلاة", en: "After Prayer Azkar" },
  "azkar.mosque": { ar: "أذكار المسجد", en: "Mosque Azkar" },
  "azkar.food": { ar: "أذكار الطعام", en: "Food Azkar" },
  "azkar.travel": { ar: "أذكار السفر", en: "Travel Azkar" },
  "azkar.dua": { ar: "أدعية متنوعة", en: "Various Duas" },
  "azkar.repeat": { ar: "التكرار", en: "Repeat" },
  "azkar.categories": { ar: "أقسام الأذكار", en: "Azkar Categories" },
  
  // Prayer names
  "prayer.fajr": { ar: "الفجر", en: "Fajr" },
  "prayer.sunrise": { ar: "الشروق", en: "Sunrise" },
  "prayer.dhuhr": { ar: "الظهر", en: "Dhuhr" },
  "prayer.asr": { ar: "العصر", en: "Asr" },
  "prayer.maghrib": { ar: "المغرب", en: "Maghrib" },
  "prayer.isha": { ar: "العشاء", en: "Isha" },
  
  // Zakat
  "zakat.title": { ar: "حاسبة الزكاة", en: "Zakat Calculator" },
  "zakat.desc": { ar: "احسب زكاتك بدقة وسهولة", en: "Calculate your Zakat accurately" },
  "zakat.type": { ar: "نوع الزكاة", en: "Zakat Type" },
  "zakat.amount": { ar: "أدخل المبلغ", en: "Enter Amount" },
  "zakat.calculate": { ar: "احسب الزكاة", en: "Calculate Zakat" },
  "zakat.result": { ar: "مقدار الزكاة المستحقة", en: "Zakat Amount Due" },
  "zakat.money": { ar: "المال", en: "Money" },
  "zakat.gold": { ar: "الذهب", en: "Gold" },
  "zakat.trade": { ar: "التجارة", en: "Trade" },
  "zakat.crypto": { ar: "العملات الرقمية", en: "Crypto" },
  "zakat.livestock": { ar: "الماشية", en: "Livestock" },
  
  // Inheritance
  "inheritance.title": { ar: "حاسبة الميراث", en: "Inheritance Calculator" },
  "inheritance.desc": { ar: "حساب تقسيم الميراث الشرعي", en: "Islamic inheritance distribution" },
  
  // Quran verse
  "verse.text": { ar: "﴿ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾", en: "﴿ Indeed, with hardship comes ease ﴾" },
  "verse.source": { ar: "سورة الشرح - آية ٦", en: "Surah Ash-Sharh - Verse 6" },
  "verse.profile": { ar: "﴿ وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ ﴾", en: "﴿ And whatever good you put forward for yourselves, you will find it with Allah ﴾" },
  "verse.profile.source": { ar: "سورة البقرة", en: "Surah Al-Baqarah" },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  setLang: () => {},
  t: (key: string) => key,
  isRTL: true,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("app_language") as Lang) || "ar";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("app_language", l);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (lang === "ar") {
      root.setAttribute("dir", "rtl");
      root.setAttribute("lang", "ar");
    } else {
      root.setAttribute("dir", "ltr");
      root.setAttribute("lang", "en");
    }
  }, [lang]);

  const t = useCallback((key: string): string => {
    return translations[key]?.[lang] || key;
  }, [lang]);

  const isRTL = lang === "ar";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
