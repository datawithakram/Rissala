// C:\D\Rissala\divine-compass\src\pages\AzkarDetail.tsx (الجزء المعدل فقط)

import { ArrowLeft, RotateCcw, Info, Share2, ChevronDown, Plus, Minus, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { azkarCategories } from "@/data/azkarData";
import { useLanguage } from "@/contexts/LanguageContext";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import ShareModal from "@/components/modals/ShareModal";

const AzkarDetail = () => {
  const { categoryId } = useParams();
  const { isRTL, lang } = useLanguage();
  const category = azkarCategories.find((c) => c.id === categoryId);
  const [counters, setCounters] = useState<Record<number, number>>({});
  const [expandedZikr, setExpandedZikr] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newZikr, setNewZikr] = useState({ text: "", count: 1 });
  const [azkarList, setAzkarList] = useState<any[]>([]);
  const [shareData, setShareData] = useState<{ isOpen: boolean; text: string }>({ isOpen: false, text: "" });

  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem("azkar_font_size");
    return saved ? parseInt(saved) : 18;
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId]);

  // Load custom list or default
  useEffect(() => {
    if (categoryId) {
      const saved = localStorage.getItem(`custom_azkar_${categoryId}`);
      if (saved) {
        setAzkarList(JSON.parse(saved));
      } else if (category) {
        setAzkarList(category.azkar);
      }
    }
  }, [categoryId, category]);

  // Save custom list
  useEffect(() => {
    if (categoryId && azkarList.length > 0) {
      localStorage.setItem(`custom_azkar_${categoryId}`, JSON.stringify(azkarList));
    }
  }, [azkarList, categoryId]);

  // Save font size
  useEffect(() => {
    localStorage.setItem("azkar_font_size", fontSize.toString());
  }, [fontSize]);

  // Load saved counters from localStorage
  useEffect(() => {
    if (categoryId) {
      const saved = localStorage.getItem(`azkar_${categoryId}`);
      if (saved) {
        setCounters(JSON.parse(saved));
      }
    }
  }, [categoryId]);

  // Save counters to localStorage
  useEffect(() => {
    if (categoryId && Object.keys(counters).length > 0) {
      localStorage.setItem(`azkar_${categoryId}`, JSON.stringify(counters));
    }
  }, [counters, categoryId]);

  // Reset counters when leaving the page (user request)
  useEffect(() => {
    return () => {
      if (categoryId) {
        localStorage.removeItem(`azkar_${categoryId}`);
        setCounters({});
      }
    };
  }, [categoryId]);

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-cairo">
          {isRTL ? "لم يتم العثور على هذا القسم" : "Category not found"}
        </p>
      </div>
    );
  }

  const handleCount = (zikrId: number, maxCount: number) => {
    setCounters((prev) => {
      const current = prev[zikrId] || 0;
      if (current >= maxCount) return prev;
      return { ...prev, [zikrId]: current + 1 };
    });
  };

  const resetCounter = (zikrId: number) => {
    setCounters((prev) => ({ ...prev, [zikrId]: 0 }));
  };

  const handleResetAll = () => {
    setCounters({});
    if (category) setAzkarList(category.azkar);
    localStorage.removeItem(`custom_azkar_${categoryId}`);
    setShowResetConfirm(false);
  };

  const toggleExpand = (zikrId: number) => {
    setExpandedZikr(expandedZikr === zikrId ? null : zikrId);
  };

  const handleAddZikr = () => {
    if (!newZikr.text.trim()) return;
    const zikr = {
      id: Date.now(),
      text: newZikr.text,
      count: newZikr.count,
    };
    setAzkarList([...azkarList, zikr]);
    setNewZikr({ text: "", count: 1 });
    setShowAddModal(false);
  };

  const handleDeleteZikr = (id: number) => {
    setAzkarList(azkarList.filter(z => z.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleShare = (text: string) => {
    setShareData({ isOpen: true, text });
  };

  const totalAzkar = azkarList.length;
  const completedAzkar = azkarList.filter(
    (z) => (counters[z.id] || 0) >= z.count
  ).length;
  const progress = totalAzkar > 0 ? (completedAzkar / totalAzkar) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className={`bg-gradient-to-r ${category.color} text-white px-5 pt-10 pb-8 rounded-b-3xl`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link to="/azkar" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
              <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
            </Link>
            <h1 className="text-xl font-bold font-amiri">
              {category.icon} {isRTL ? category.title : category.titleEn}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              title={isRTL ? "تصغير الخط" : "Decrease Font Size"}
            >
              <Minus size={16} />
            </button>
            <button
              onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              title={isRTL ? "تكبير الخط" : "Increase Font Size"}
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              title={isRTL ? "إعادة تعيين الكل" : "Reset all"}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Category description */}
        <p className="text-sm opacity-90 font-cairo text-center mb-4">
          {isRTL ? category.description : category.descriptionEn}
        </p>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-cairo">
            <span>{isRTL ? "التقدم" : "Progress"}</span>
            <span>{completedAzkar}/{totalAzkar}</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="px-5 mt-4 flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-cairo font-bold text-sm active:scale-95 transition"
        >
          <Plus size={16} />
          {isRTL ? "إضافة ذكر" : "Add Zikr"}
        </button>
      </div>

      {/* Azkar List */}
      <div className="px-5 mt-4 space-y-4">
        {azkarList.map((zikr, i) => {
          const current = counters[zikr.id] || 0;
          const isDone = current >= zikr.count;
          const progress = Math.min((current / zikr.count) * 100, 100);
          const isExpanded = expandedZikr === zikr.id;

          return (
            <div
              key={zikr.id}
              className={`card-islamic animate-fade-up transition-all ${isDone ? "border-emerald-500/30 bg-emerald-50/5" : ""
                } ${isExpanded ? "ring-2 ring-primary/20" : ""}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex justify-between items-start mb-2">
                {/* Zikr text */}
                <div
                  onClick={() => toggleExpand(zikr.id)}
                  className="cursor-pointer group relative flex-1"
                >
                  <p 
                    className="font-amiri leading-loose text-card-foreground mb-1 text-center"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {zikr.text}
                  </p>
                </div>
                
                {/* Delete button */}
                <button
                   onClick={() => setShowDeleteConfirm(zikr.id)}
                   className="p-1.5 text-muted-foreground/40 hover:text-destructive transition-colors ml-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* مؤشر لعرض التفاصيل */}
              <div 
                onClick={() => toggleExpand(zikr.id)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition cursor-pointer mb-2"
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                />
                <span>
                  {isExpanded
                    ? (isRTL ? "إخفاء التفاصيل" : "Hide details")
                    : (isRTL ? "اضغط لعرض التفاصيل" : "Tap for details")}
                </span>
              </div>

              {/* لوحة التفاصيل الموسعة */}
              {isExpanded && (
                <div className="mt-3 p-4 bg-muted rounded-xl space-y-3 animate-fade-up">
                  {zikr.reward && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-primary font-cairo">
                        {isRTL ? "✨ الثواب" : "✨ Reward"}
                      </p>
                      <p className="text-sm text-card-foreground font-cairo">
                        {zikr.reward}
                      </p>
                    </div>
                  )}
                  {zikr.reference && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-primary font-cairo">
                        {isRTL ? "📚 المصدر" : "📚 Reference"}
                      </p>
                      <p className="text-sm text-card-foreground font-cairo">
                        {zikr.reference}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* العلامات السريعة */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-cairo font-semibold">
                  {isRTL ? "التكرار" : "Repeat"}: {zikr.count}
                </span>
                <button
                  onClick={() => handleShare(zikr.text)}
                  className="flex items-center gap-1 text-[10px] bg-sky-500/10 text-sky-600 px-2 py-1 rounded-full font-cairo font-semibold hover:bg-sky-500/20 transition"
                >
                  <Share2 size={12} />
                  {isRTL ? "مشاركة" : "Share"}
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted rounded-full mt-3 mb-3 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Counter buttons */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => handleCount(zikr.id, zikr.count)}
                  disabled={isDone}
                  className={`flex-1 py-3 rounded-xl font-bold font-cairo text-sm transition-all ${isDone
                      ? "bg-emerald-500 text-white cursor-not-allowed"
                      : "bg-primary text-primary-foreground active:scale-95 hover:bg-primary/90"
                    }`}
                >
                  {isDone ? (
                    <span className="flex items-center justify-center gap-2">
                      ✓ {isRTL ? "تم" : "Done"}
                    </span>
                  ) : (
                    `${current} / ${zikr.count}`
                  )}
                </button>

                <button
                  onClick={() => resetCounter(zikr.id)}
                  className="p-3 text-muted-foreground hover:text-primary transition rounded-xl bg-muted hover:bg-muted/80"
                  title={isRTL ? "إعادة تعيين" : "Reset"}
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Zikr Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="gradient-primary p-6 text-white">
              <h2 className="text-xl font-bold font-cairo text-center">
                {isRTL ? "إضافة ذكر جديد" : "Add New Zikr"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground font-cairo px-1">
                  {isRTL ? "نص الذكر" : "Zikr Text"}
                </label>
                <textarea
                  value={newZikr.text}
                  onChange={(e) => setNewZikr({ ...newZikr, text: e.target.value })}
                  placeholder={isRTL ? "اكتب الذكر هنا..." : "Type zikr here..."}
                  className="w-full min-h-[100px] p-4 rounded-2xl bg-muted border-none focus:ring-2 focus:ring-primary/20 font-amiri text-lg leading-relaxed placeholder:text-muted-foreground/50 resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground font-cairo px-1">
                  {isRTL ? "عدد التكرارات" : "Count"}
                </label>
                <div className="flex items-center gap-4 bg-muted p-2 rounded-2xl px-4">
                   <button 
                     onClick={() => setNewZikr({ ...newZikr, count: Math.max(1, newZikr.count - 1) })}
                     className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary"
                   >
                     <Minus size={16} />
                   </button>
                   <span className="flex-1 text-center font-bold text-lg font-cairo">{newZikr.count}</span>
                   <button 
                     onClick={() => setNewZikr({ ...newZikr, count: newZikr.count + 1 })}
                     className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary"
                   >
                     <Plus size={16} />
                   </button>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 rounded-2xl bg-muted text-card-foreground font-cairo font-bold transition hover:bg-muted/80"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleAddZikr}
                className="flex-1 py-4 rounded-2xl gradient-primary text-white font-cairo font-bold transition shadow-lg shadow-primary/20 active:scale-95"
              >
                {isRTL ? "إضافة" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetAll}
        title={isRTL ? "إعادة تعيين الأذكار" : "Reset Azkar"}
        message={isRTL ? "هل أنت متأكد من إعادة تعيين جميع أذكار وعدادات هذا القسم إلى الإعدادات الافتراضية؟" : "Are you sure you want to reset all azkar and counters in this category to defaults?"}
        confirmText={isRTL ? "إعادة تعيين" : "Reset"}
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => showDeleteConfirm && handleDeleteZikr(showDeleteConfirm)}
        title={isRTL ? "حذف الذكر" : "Delete Zikr"}
        message={isRTL ? "هل أنت متأكد من حذف هذا الذكر من القائمة؟" : "Are you sure you want to delete this zikr from the list?"}
        confirmText={isRTL ? "حذف" : "Delete"}
        isDestructive={true}
      />

      <ShareModal
        isOpen={shareData.isOpen}
        onClose={() => setShareData({ ...shareData, isOpen: false })}
        text={shareData.text}
      />
      <BottomNav />
    </div>
  );
};

export default AzkarDetail;