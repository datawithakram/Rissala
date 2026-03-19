// C:\D\Rissala\divine-compass\src\pages\Azkar.tsx

import { useState, useEffect } from "react";
import { ArrowLeft, RotateCcw, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { azkarCategories } from "@/data/azkarData";
import { useLanguage } from "@/contexts/LanguageContext";

const Azkar = () => {
  const { t, isRTL } = useLanguage();
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [tasbeehTarget] = useState(33);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Load tasbeeh count from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tasbeeh_count");
    if (saved) setTasbeehCount(parseInt(saved));
  }, []);

  // Save tasbeeh count to localStorage
  useEffect(() => {
    localStorage.setItem("tasbeeh_count", tasbeehCount.toString());
  }, [tasbeehCount]);

  const progress = Math.min((tasbeehCount / tasbeehTarget) * 100, 100);
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Filter categories based on search
  const filteredCategories = azkarCategories.filter(cat => {
    const title = isRTL ? cat.title : cat.titleEn;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Featured categories (morning & evening)
  const featured = filteredCategories.filter((c) => c.id === "morning" || c.id === "evening");
  const others = filteredCategories.filter((c) => c.id !== "morning" && c.id !== "evening");

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary text-primary-foreground px-5 pt-10 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition">
              <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
            </Link>
            <h1 className="text-xl font-bold font-amiri">{t("azkar.title")}</h1>
          </div>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition"
          >
            <Search size={18} />
          </button>
        </div>
        <p className="text-sm opacity-80 font-cairo text-center">
          {isRTL ? "حصن المسلم - أذكار وأدعية من السنة النبوية" : "Fortress of the Muslim - Azkar and supplications from Sunnah"}
        </p>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-5 mt-4 animate-fade-up">
          <div className="card-islamic relative">
            <Search size={16} className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-muted-foreground`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? "ابحث عن ذكر..." : "Search for azkar..."}
              className={`w-full ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 bg-muted rounded-xl text-foreground text-sm font-cairo border border-border focus:outline-none focus:ring-2 focus:ring-primary`}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`absolute ${isRTL ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary`}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="px-5 mt-6 space-y-5">
        {/* Tasbeeh Counter */}
        <div className="card-islamic flex flex-col items-center py-6 animate-fade-up">
          <p className="text-sm font-semibold font-cairo text-card-foreground mb-4">{t("azkar.tasbeeh")}</p>
          <div className="relative">
            <svg width="130" height="130" className="-rotate-90">
              <circle cx="65" cy="65" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="65" cy="65" r="52" fill="none"
                stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            </svg>
            <button
              onClick={() => setTasbeehCount((c) => c + 1)}
              className="absolute inset-0 flex flex-col items-center justify-center active:scale-95 transition-transform"
            >
              <span className={`text-3xl font-bold font-cairo text-primary ${tasbeehCount > 0 ? "animate-count" : ""}`}>
                {tasbeehCount}
              </span>
              <span className="text-[10px] text-muted-foreground">/ {tasbeehTarget}</span>
            </button>
          </div>
          <button
            onClick={() => setTasbeehCount(0)}
            className="mt-3 text-muted-foreground hover:text-primary transition p-2 rounded-full"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Results count */}
        {searchQuery && (
          <p className="text-xs text-muted-foreground font-cairo text-center">
            {isRTL 
              ? `تم العثور على ${filteredCategories.length} أقسام`
              : `Found ${filteredCategories.length} categories`}
          </p>
        )}

        {/* Featured: Morning & Evening */}
        {featured.length > 0 && (
          <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: "100ms" }}>
            {featured.map((cat) => (
              <Link
                key={cat.id}
                to={`/azkar/${cat.id}`}
                className="card-islamic hover:shadow-md transition-all hover:-translate-y-0.5 group text-center py-6"
              >
                <span className="text-3xl block mb-2">{cat.icon}</span>
                <p className="text-sm font-bold font-cairo text-card-foreground">
                  {isRTL ? cat.title : cat.titleEn}
                </p>
                <p className="text-[10px] text-muted-foreground font-cairo mt-1">
                  {cat.azkar.length} {isRTL ? "ذكر" : "azkar"}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Other Categories */}
        {others.length > 0 ? (
          <div>
            <p className="text-sm font-semibold font-cairo text-muted-foreground mb-3">
              {t("azkar.categories")}
            </p>
            <div className="space-y-2">
              {others.map((cat, i) => (
                <Link
                  key={cat.id}
                  to={`/azkar/${cat.id}`}
                  className="card-islamic flex items-center gap-3 hover:shadow-md transition-all animate-fade-up group"
                  style={{ animationDelay: `${(i + 2) * 60}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <span className="text-lg">{cat.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold font-cairo text-card-foreground">
                      {isRTL ? cat.title : cat.titleEn}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-cairo">
                      {cat.azkar.length} {isRTL ? "ذكر" : "azkar"}
                    </p>
                    {cat.description && (
                      <p className="text-[9px] text-muted-foreground/70 font-cairo mt-1 line-clamp-1">
                        {isRTL ? cat.description : cat.descriptionEn}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : searchQuery ? (
          <div className="card-islamic text-center py-8">
            <p className="text-muted-foreground font-cairo">
              {isRTL ? "لا توجد نتائج للبحث" : "No results found"}
            </p>
          </div>
        ) : null}
      </div>

      <BottomNav />
    </div>
  );
};

export default Azkar;