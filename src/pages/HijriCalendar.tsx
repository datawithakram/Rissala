import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

// ==================== Islamic Calendar Utilities ====================

// أسماء الأشهر الهجرية
const hijriMonths: Record<string, { ar: string; en: string }>[] = [
  { ar: "محرم", en: "Muharram" },
  { ar: "صفر", en: "Safar" },
  { ar: "ربيع الأول", en: "Rabi' al-Awwal" },
  { ar: "ربيع الثاني", en: "Rabi' al-Thani" },
  { ar: "جمادى الأولى", en: "Jumada al-Awwal" },
  { ar: "جمادى الآخرة", en: "Jumada al-Thani" },
  { ar: "رجب", en: "Rajab" },
  { ar: "شعبان", en: "Sha'ban" },
  { ar: "رمضان", en: "Ramadan" },
  { ar: "شوال", en: "Shawwal" },
  { ar: "ذو القعدة", en: "Dhu al-Qi'dah" },
  { ar: "ذو الحجة", en: "Dhu al-Hijjah" },
];

// المناسبات الإسلامية مع وصف مختصر
const islamicEvents: Record<
  string,
  { ar: string; en: string; description?: { ar: string; en: string } }
> = {
  "1-1": {
    ar: "رأس السنة الهجرية",
    en: "Hijri New Year",
    description: {
      ar: "بداية العام الهجري الجديد",
      en: "Beginning of the new Hijri year",
    },
  },
  "10-1": {
    ar: "يوم عاشوراء",
    en: "Day of Ashura",
    description: {
      ar: "صيام هذا اليوم يكفر سنة ماضية",
      en: "Fasting this day expiates the sins of the previous year",
    },
  },
  "12-3": {
    ar: "المولد النبوي",
    en: "Prophet's Birthday",
    description: {
      ar: "مولد النبي محمد ﷺ",
      en: "Birthday of Prophet Muhammad ﷺ",
    },
  },
  "27-7": {
    ar: "الإسراء والمعراج",
    en: "Isra and Mi'raj",
    description: {
      ar: "رحلة الإسراء والمعراج",
      en: "The Night Journey and Ascension",
    },
  },
  "15-8": {
    ar: "ليلة النصف من شعبان",
    en: "Mid-Sha'ban",
    description: {
      ar: "ليلة مباركة يغفر الله فيها للمسلمين",
      en: "Blessed night when Allah forgives Muslims",
    },
  },
  "1-9": {
    ar: "بداية رمضان",
    en: "Start of Ramadan",
    description: {
      ar: "أول أيام شهر الصيام",
      en: "First day of the fasting month",
    },
  },
  "27-9": {
    ar: "ليلة القدر",
    en: "Laylat al-Qadr",
    description: {
      ar: "ليلة خير من ألف شهر",
      en: "Night better than a thousand months",
    },
  },
  "1-10": {
    ar: "عيد الفطر",
    en: "Eid al-Fitr",
    description: {
      ar: "أول أيام عيد الفطر المبارك",
      en: "First day of Eid al-Fitr",
    },
  },
  "9-12": {
    ar: "يوم عرفة",
    en: "Day of Arafah",
    description: {
      ar: "يوم الحج الأكبر وصيامه يكفر سنتين",
      en: "The day of Hajj, fasting expiates two years of sins",
    },
  },
  "10-12": {
    ar: "عيد الأضحى",
    en: "Eid al-Adha",
    description: {
      ar: "أول أيام عيد الأضحى المبارك",
      en: "First day of Eid al-Adha",
    },
  },
};

// أسماء أيام الأسبوع
const dayNames = {
  ar: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
  en: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
};

/**
 * الحصول على اسم اليوم
 */
const getDayName = (dayIndex: number, lang: "ar" | "en" = "ar"): string => {
  return dayNames[lang][dayIndex];
};

/**
 * الحصول على المناسبة لليوم والشهر
 */
const getIslamicEvent = (day: number, month: number) => {
  return islamicEvents[`${day}-${month}`];
};

/**
 * التحقق من صحة التاريخ الهجري
 */
const isValidHijriDate = (day: number, month: number, year: number): boolean => {
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 30) return false;
  if (year < 1) return false;
  return true;
};

/**
 * الحصول على عدد أيام الشهر الهجري (تقريبي)
 */
const getDaysInHijriMonth = (month: number, year: number): number => {
  // هذا حساب تقريبي، يمكن تحسينه باستخدام حساب فلكي دقيق
  // الأشهر الفردية 30 يوم، والزوجية 29 يوم مع بعض الاستثناءات
  const isLeapYear = (year * 11 + 14) % 30 < 11;

  if (month === 12 && isLeapYear) {
    return 30;
  }

  return month % 2 === 1 ? 30 : 29;
};

/**
 * تحويل التاريخ الهجري إلى ميلادي (تقريبي)
 */
const hijriToGregorian = (day: number, month: number, year: number) => {
  // هذا تحويل تقريبي، للحصول على نتائج دقيقة يجب استخدام مكتبة متخصصة
  const hijriEpoch = 1948440; // يوليان داي

  // حساب الأيام منذ بداية التقويم الهجري
  let totalDays = 0;
  for (let y = 1; y < year; y++) {
    totalDays += 354; // متوسط أيام السنة الهجرية
    totalDays += (y * 11 + 14) % 30 < 11 ? 1 : 0; // إضافة الأيام الكبيسة
  }
  for (let m = 1; m < month; m++) {
    totalDays += getDaysInHijriMonth(m, year);
  }
  totalDays += day;

  // تحويل إلى التاريخ الميلادي (نتيجة تقريبية)
  const julianDay = hijriEpoch + totalDays;

  // تحويل من جوليان إلى ميلادي (تبسيط شديد)
  const wjd = Math.floor(julianDay - 0.5) + 0.5;
  const depoch = wjd - 2451545.0;
  const quadric = Math.floor(depoch / 36525.0);

  // هذه عملية تبسيطية جداً
  return {
    day: day + 10, // تقريب بسيط جداً
    month: month + 3 > 12 ? month + 3 - 12 : month + 3,
    year: year + 622,
  };
};

// ==================== Main Calendar Component ====================

const HijriCalendar = () => {
  const { t, isRTL, lang } = useLanguage();
  const { hijriDate, hijriAdjustment } = usePrayerTimes();
  const [monthIndex, setMonthIndex] = useState<number>(8); // رمضان (سبتمبر)
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [year, setYear] = useState<number>(1447);
  const [daysInMonth, setDaysInMonth] = useState<number>(30);
  const [startDay, setStartDay] = useState<number>(0);
  
  // State for adjusted date
  const [adjustedDay, setAdjustedDay] = useState<number>(1);
  const [adjustedMonth, setAdjustedMonth] = useState<string>("");
  const [adjustedMonthIndex, setAdjustedMonthIndex] = useState<number>(8);
  const [adjustedYear, setAdjustedYear] = useState<number>(1447);

  // تطبيق التعديل على التاريخ الهجري
  useEffect(() => {
    if (hijriDate) {
      // استخراج المكونات من التاريخ الأصلي
      const originalDay = parseInt(hijriDate.day || "1");
      const originalMonthName = hijriDate.month || "";
      const originalYear = parseInt(hijriDate.year || "1447");
      
      // العثور على فهرس الشهر الأصلي
      const originalMonthIndex = hijriMonths.findIndex(
        (m) => m.ar === originalMonthName || m.en === originalMonthName
      );
      
      if (originalMonthIndex !== -1) {
        // تطبيق التعديل على اليوم
        let newDay = originalDay + hijriAdjustment;
        let newMonthIndex = originalMonthIndex;
        let newYear = originalYear;
        
        // معالجة تجاوز نهاية الشهر
        const daysInCurrentMonth = getDaysInHijriMonth(newMonthIndex + 1, newYear);
        
        while (newDay > daysInCurrentMonth) {
          newDay -= daysInCurrentMonth;
          newMonthIndex++;
          if (newMonthIndex > 11) {
            newMonthIndex = 0;
            newYear++;
          }
        }
        
        // معالجة أقل من 1
        while (newDay < 1) {
          newMonthIndex--;
          if (newMonthIndex < 0) {
            newMonthIndex = 11;
            newYear--;
          }
          const daysInPrevMonth = getDaysInHijriMonth(newMonthIndex + 1, newYear);
          newDay += daysInPrevMonth;
        }
        
        setAdjustedDay(newDay);
        setAdjustedMonthIndex(newMonthIndex);
        setAdjustedMonth(hijriMonths[newMonthIndex][lang] || hijriMonths[newMonthIndex].ar);
        setAdjustedYear(newYear);
      } else {
        // إذا لم نتمكن من العثور على الشهر، نستخدم القيم الافتراضية مع التعديل
        setAdjustedDay(originalDay + hijriAdjustment);
        setAdjustedMonthIndex(8); // رمضان افتراضياً
        setAdjustedMonth(hijriMonths[8][lang] || hijriMonths[8].ar);
        setAdjustedYear(originalYear);
      }
    }
  }, [hijriDate, hijriAdjustment, lang]);

  // تحديث حالة monthIndex و year و selectedDay بناءً على التاريخ المعدل
  useEffect(() => {
    setMonthIndex(adjustedMonthIndex);
    setYear(adjustedYear);
    setSelectedDay(adjustedDay);
  }, [adjustedMonthIndex, adjustedYear, adjustedDay]);

  // حساب أول يوم في الشهر وعدد الأيام
  useEffect(() => {
    // حساب تقريبي لبداية الشهر (يمكن تحسينه)
    const calculateStartDay = () => {
      const baseOffset = (monthIndex * 2 + year) % 7;
      return baseOffset;
    };
    setStartDay(calculateStartDay());

    // حساب عدد الأيام في الشهر باستخدام الدالة المساعدة
    setDaysInMonth(getDaysInHijriMonth(monthIndex + 1, year));
  }, [monthIndex, year]);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  const handlePrevMonth = () => {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setYear(year - 1);
    } else {
      setMonthIndex(monthIndex - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setYear(year + 1);
    } else {
      setMonthIndex(monthIndex + 1);
    }
    setSelectedDay(null);
  };

  const getEvent = (day: number) => {
    return getIslamicEvent(day, monthIndex + 1);
  };

  const isToday = (day: number) => {
    // نقارن مع التاريخ المعدل وليس الأصلي
    return (
      adjustedDay === day &&
      adjustedMonthIndex === monthIndex &&
      adjustedYear === year
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-primary text-primary-foreground px-5 pt-10 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-3">
          <Link
            to="/"
            className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition"
          >
            <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          </Link>
          <h1 className="text-xl font-bold font-amiri">
            {lang === "ar" ? "التقويم الهجري" : "Hijri Calendar"}
          </h1>
        </div>

        {/* عرض التاريخ المعدل في الهيدر */}
        {hijriDate && (
          <div className="text-center mb-2">
            <span className="text-sm font-amiri">
              {adjustedDay} {adjustedMonth} {adjustedYear} هـ
            </span>
          </div>
        )}

        {/* عرض التعديل الهجري إذا كان موجوداً */}
        {hijriAdjustment !== 0 && (
          <div className="text-center mt-2">
            <span className="text-xs opacity-70 font-cairo bg-primary-foreground/10 px-3 py-1 rounded-full">
              {lang === "ar"
                ? `تعديل هجري: ${hijriAdjustment > 0 ? `+${hijriAdjustment}` : hijriAdjustment} يوم`
                : `Hijri adjustment: ${hijriAdjustment > 0 ? `+${hijriAdjustment}` : hijriAdjustment} day${hijriAdjustment !== 1 ? "s" : ""}`}
            </span>
          </div>
        )}
      </div>

      <div className="px-5 mt-6 space-y-4">
        {/* Month Selector */}
        <div className="card-islamic flex items-center justify-between animate-fade-up">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-muted transition"
            aria-label={lang === "ar" ? "الشهر السابق" : "Previous month"}
          >
            {isRTL ? (
              <ChevronRight size={20} className="text-card-foreground" />
            ) : (
              <ChevronLeft size={20} className="text-card-foreground" />
            )}
          </button>
          <div className="text-center">
            <p className="text-lg font-bold font-amiri text-card-foreground">
              {hijriMonths[monthIndex]?.[lang] || hijriMonths[monthIndex]?.ar}
            </p>
            <p className="text-xs text-muted-foreground font-cairo">
              {year} {lang === "ar" ? "هـ" : "AH"}
            </p>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-muted transition"
            aria-label={lang === "ar" ? "الشهر التالي" : "Next month"}
          >
            {isRTL ? (
              <ChevronLeft size={20} className="text-card-foreground" />
            ) : (
              <ChevronRight size={20} className="text-card-foreground" />
            )}
          </button>
        </div>

        {/* Calendar Grid */}
        <div
          className="card-islamic animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className="text-center text-[10px] font-bold text-muted-foreground font-cairo py-1"
              >
                {getDayName(i, lang)}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((b) => (
              <div key={`blank-${b}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const event = getEvent(day);
              const isSelected = selectedDay === day;
              const today = isToday(day);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`relative aspect-square flex items-center justify-center rounded-xl text-sm font-cairo transition-all duration-200 ${isSelected
                      ? "bg-primary text-primary-foreground shadow-md scale-110"
                      : today
                        ? "bg-emerald-light text-primary font-bold border-2 border-primary/30"
                        : "text-card-foreground hover:bg-muted"
                    }`}
                >
                  {day}
                  {event && (
                    <div className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-gold" />
                  )}
                  {today && !isSelected && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Info */}
        {selectedDay && (
          <div className="card-islamic animate-scale-in">
            <p className="text-sm font-bold font-cairo text-card-foreground">
              {selectedDay}{" "}
              {hijriMonths[monthIndex]?.[lang] || hijriMonths[monthIndex]?.ar}{" "}
              {year} {lang === "ar" ? "هـ" : "AH"}
            </p>
            {getEvent(selectedDay) ? (
              <div className="mt-2">
                <p className="text-sm text-gold-dark font-bold font-cairo">
                  🌙{" "}
                  {getEvent(selectedDay)?.[lang] || getEvent(selectedDay)?.ar}
                </p>
                {getEvent(selectedDay)?.description && (
                  <p className="text-xs text-muted-foreground font-cairo mt-1">
                    {getEvent(selectedDay).description?.[lang] ||
                      getEvent(selectedDay).description?.ar}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-cairo mt-1">
                {lang === "ar"
                  ? "لا توجد مناسبات في هذا اليوم"
                  : "No events on this day"}
              </p>
            )}

            {/* نصائح الصيام */}
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground font-cairo">
                💡{" "}
                {lang === "ar"
                  ? "يُستحب صيام الأيام البيض: 13، 14، 15 من كل شهر هجري"
                  : "Recommended fasting: White days (13th, 14th, 15th of each month)"}
              </p>
            </div>

            <p className="text-[10px] text-muted-foreground/60 font-cairo mt-2">
              {lang === "ar"
                ? "تقويم هجري - يعتمد على رؤية الهلال"
                : "Hijri calendar - Based on moon sighting"}
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default HijriCalendar;