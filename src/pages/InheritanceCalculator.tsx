import React, { useState } from "react";
import { ArrowLeft, Users, Plus, Trash2, ChevronDown, Info } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveCalculation } from "@/pages/CalculationHistory";
import CurrencyModal, { currencies } from "@/components/modals/CurrencyModal";
import { calculateInheritance, HeirInput, HeirType, ShareResult } from "@/services/inheritanceService";
import AppModal from "@/components/modals/AppModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import HeirSelectorModal from "@/components/modals/HeirSelectorModal";

// أنواع الورثة للعرض في الواجهة
const UI_HEIRS: { value: HeirType; label: { ar: string; en: string }; icon: string }[] = [
  { value: "husband", label: { ar: "زوج", en: "Husband" }, icon: "👨" },
  { value: "wife", label: { ar: "زوجة", en: "Wife" }, icon: "👩" },
  { value: "father", label: { ar: "أب", en: "Father" }, icon: "👨‍🦳" },
  { value: "mother", label: { ar: "أم", en: "Mother" }, icon: "👩‍🦳" },
  { value: "grandfather", label: { ar: "جد", en: "Grandfather" }, icon: "👴" },
  { value: "grandmother", label: { ar: "جدة", en: "Grandmother" }, icon: "👵" },
  { value: "son", label: { ar: "ابن", en: "Son" }, icon: "👦" },
  { value: "daughter", label: { ar: "بنت", en: "Daughter" }, icon: "👧" },
  { value: "grandson", label: { ar: "ابن ابن", en: "Grandson" }, icon: "👦" },
  { value: "granddaughter", label: { ar: "بنت ابن", en: "Granddaughter" }, icon: "👧" },
  { value: "brother", label: { ar: "أخ شقيق", en: "Full Brother" }, icon: "👨" },
  { value: "sister", label: { ar: "أخت شقيقة", en: "Full Sister" }, icon: "👩" },
  { value: "brother_paternal", label: { ar: "أخ لأب", en: "Paternal Brother" }, icon: "👨" },
  { value: "sister_paternal", label: { ar: "أخت لأب", en: "Paternal Sister" }, icon: "👩" },
  { value: "brother_maternal", label: { ar: "أخ لأم", en: "Maternal Brother" }, icon: "👨" },
  { value: "sister_maternal", label: { ar: "أخت لأم", en: "Maternal Sister" }, icon: "👩" },
  { value: "uncle", label: { ar: "عم شقيق", en: "Paternal Uncle" }, icon: "👨" },
];

const shareColors = [
  "bg-primary", "bg-secondary", "bg-accent", "bg-gold",
  "bg-emerald-dark", "bg-navy-light", "bg-destructive", "bg-muted-foreground",
];

const InheritanceCalculator = React.forwardRef<HTMLDivElement>((_, ref) => {
  const { isRTL, lang } = useLanguage();
  const [totalAmount, setTotalAmount] = useState("");
  const [heirs, setHeirs] = useState<{ type: HeirType | ""; count: number }[]>([]);
  const [result, setResult] = useState<{ shares: ShareResult[]; calculations: { step: string; details: string }[] } | null>(null);
  
  // Modals state
  const [currency, setCurrency] = useState("SAR");
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState<{ isOpen: boolean; title: string; content: string }>({ isOpen: false, title: "", content: "" });
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<any>(null);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "", message: "" });
  const [selectorModal, setSelectorModal] = useState<{ isOpen: boolean; rowIndex: number | null }>({ isOpen: false, rowIndex: null });

  const confirmSave = () => {
    if (pendingSaveData) {
      const { total, validHeirs } = pendingSaveData;
      saveCalculation({
        type: "inheritance",
        amount: total,
        result: total,
        details: validHeirs
          .map((h: any) => {
            const ht = UI_HEIRS.find((t) => t.value === h.type);
            return `${ht?.label[lang]} (${h.count})`;
          })
          .join("، "),
      });
      setShowSaveConfirm(false);
      setShowSaveSuccess(true);
      setPendingSaveData(null);
    }
  };

  const handleSaveResult = () => {
    if (result && totalAmount) {
      const total = parseFloat(totalAmount);
      const validHeirs = heirs.filter((h) => h.type !== "" && h.count > 0) as HeirInput[];
      setPendingSaveData({ total, validHeirs });
      setShowSaveConfirm(true);
    }
  };

  const currSymbol = currencies.find((c) => c.id === currency)?.symbol[lang] || currency;

  const addHeir = () => {
    if (heirs.length < 15) setHeirs([...heirs, { type: "", count: 0 }]);
  };

  const removeHeir = (i: number) => {
    setHeirs(heirs.filter((_, idx) => idx !== i));
    setResult(null);
  };

  const updateHeirCount = (index: number, value: string) => {
    const updated = [...heirs];
    if (value === "") {
      updated[index].count = 0;
    } else {
      const num = parseInt(value);
      if (!isNaN(num) && num > 0) {
        updated[index].count = num;
      }
    }
    setHeirs(updated);
    setResult(null);
  };

  const updateHeirType = (index: number, type: string) => {
    const updated = [...heirs];
    updated[index].type = type as HeirType;
    if (updated[index].count === 0) updated[index].count = 1; // Default to 1
    
    // Some types can only be 1 (e.g. husband, father, mother)
    if (["husband", "father", "mother", "grandfather"].includes(type)) {
      updated[index].count = 1;
    }
    
    setHeirs(updated);
    setResult(null);
  };

  const handleCalculate = () => {
    const total = parseFloat(totalAmount);
    if (isNaN(total) || total <= 0) {
      setErrorModal({
        isOpen: true,
        title: lang === "ar" ? "خطأ" : "Error",
        message: lang === "ar" ? "الرجاء إدخال مبلغ صحيح" : "Please enter a valid amount"
      });
      return;
    }

    const validHeirs = heirs.filter((h) => h.type !== "" && h.count > 0) as HeirInput[];
    if (validHeirs.length === 0) {
      setErrorModal({
        isOpen: true,
        title: lang === "ar" ? "خطأ" : "Error",
        message: lang === "ar" ? "الرجاء إضافة ورثة مع تحديد العدد" : "Please add heirs with count"
      });
      return;
    }

    // Checking for conflicts
    const counts = { husband: 0, wife: 0 };
    validHeirs.forEach((h) => {
      if (h.type === "husband") counts.husband += h.count;
      if (h.type === "wife") counts.wife += h.count;
    });

    if (counts.husband > 0 && counts.wife > 0) {
      setErrorModal({
        isOpen: true,
        title: lang === "ar" ? "تعارض" : "Conflict",
        message: lang === "ar" ? "لا يمكن الجمع بين الزوج والزوجة في نفس المسألة" : "Cannot have both husband and wife"
      });
      return;
    }

    const calcResult = calculateInheritance(total, validHeirs, lang, currSymbol);
    setResult(calcResult);
  };

  return (
    <div ref={ref} className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary text-primary-foreground px-5 pt-10 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition">
            <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          </Link>
          <h1 className="text-xl font-bold font-amiri">
            {lang === "ar" ? "حاسبة الميراث" : "Inheritance Calculator"}
          </h1>
        </div>
        <p className="text-sm opacity-80 font-cairo">
          {lang === "ar" ? "حساب تقسيم الميراث حسب القرآن والسنة" : "Islamic inheritance distribution according to Quran and Sunnah"}
        </p>
      </div>

      <div className="px-5 mt-6 space-y-4">
        {/* Currency Selector */}
        <div className="card-islamic animate-fade-up">
          <p className="text-sm font-semibold mb-2 font-cairo text-card-foreground">
            {lang === "ar" ? "العملة" : "Currency"}
          </p>
          <button
            onClick={() => setShowCurrencyModal(true)}
            className="w-full flex items-center justify-between bg-muted rounded-xl px-4 py-3 text-sm font-cairo text-card-foreground hover:bg-muted/80 transition"
          >
            <span>
              {currencies.find((c) => c.id === currency)?.label[lang]} ({currSymbol})
            </span>
            <ChevronDown size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Total Amount */}
        <div className="card-islamic animate-fade-up" style={{ animationDelay: "50ms" }}>
          <label className="text-sm font-semibold font-cairo text-card-foreground block mb-2">
            {lang === "ar" ? "إجمالي التركة" : "Total Estate"}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => {
                setTotalAmount(e.target.value);
                setResult(null);
              }}
              placeholder="0"
              className="flex-1 bg-muted/40 rounded-2xl px-4 py-3 text-lg font-bold font-cairo text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary border border-border/40 transition-all shadow-inner"
            />
            <div className="flex items-center bg-muted rounded-xl px-4 text-sm font-cairo text-muted-foreground font-bold whitespace-nowrap shadow-inner">
              {currSymbol}
            </div>
          </div>
        </div>

        {/* Heirs */}
        <div className="card-islamic animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold font-cairo text-card-foreground flex items-center gap-2">
              <Users size={16} className="text-primary" /> {lang === "ar" ? "الورثة" : "Heirs"}
            </p>
            <button
              onClick={addHeir}
              className="text-primary p-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition active:scale-95"
            >
              <Plus size={18} />
            </button>
          </div>

          {heirs.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground font-cairo">
                {lang === "ar" ? "لم يتم إضافة أي وارث بعد. اضغط على الزر للإضافة" : "No heirs added yet. Click + to add"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {heirs.map((heir, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex-1 relative">
                    <button
                      onClick={() => setSelectorModal({ isOpen: true, rowIndex: i })}
                      className="w-full h-full flex items-center justify-between bg-muted rounded-xl px-4 py-3 text-sm font-cairo text-card-foreground hover:bg-muted/80 transition border border-transparent active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {heir.type ? (
                          <>
                            <span className="text-lg">{UI_HEIRS.find(t => t.value === heir.type)?.icon}</span>
                            <span className="truncate">{UI_HEIRS.find(t => t.value === heir.type)?.label[lang]}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground/50">
                            {lang === "ar" ? "اختر الوارث" : "Select Heir"}
                          </span>
                        )}
                      </div>
                      <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />
                    </button>
                  </div>

                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={heir.count === 0 ? "" : heir.count}
                    onChange={(e) => updateHeirCount(i, e.target.value)}
                    placeholder={lang === "ar" ? "العدد" : "Qty"}
                    disabled={["husband", "father", "mother", "grandfather"].includes(heir.type)}
                    className="w-[70px] bg-muted rounded-xl px-1 py-3 text-sm font-cairo text-center text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition border border-transparent disabled:opacity-50"
                  />

                  <button
                    onClick={() => removeHeir(i)}
                    className="p-3 text-destructive hover:bg-destructive/10 rounded-xl transition flex-shrink-0 bg-muted"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleCalculate}
          className="w-full gradient-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg font-cairo shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          {lang === "ar" ? "احسب التوزيع الشرعي" : "Calculate Islamic Distribution"}
        </button>

        {/* Results */}
        {result && (
          <div className="card-islamic animate-scale-in space-y-4">
            <h3 className="text-lg font-bold font-cairo text-card-foreground border-b border-border/50 pb-3">
              {lang === "ar" ? "نتيجة التقسيم" : "Distribution Result"}
            </h3>

            {result.shares.length === 0 ? (
              <p className="text-center text-sm text-destructive font-cairo py-4">
                {lang === "ar" ? "لا يوجد ورثة مستحقين." : "No eligible heirs."}
              </p>
            ) : (
              <>
                <div className="flex rounded-full overflow-hidden h-6 shadow-sm">
                  {result.shares.map((r, i) => (
                    <div
                      key={i}
                      className={`${shareColors[i % shareColors.length]} transition-all duration-500`}
                      style={{ width: `${r.percentage}%` }}
                      title={`${r.label}: ${r.percentage.toFixed(1)}%`}
                    />
                  ))}
                </div>

                <div className="space-y-3">
                  {result.shares.map((r, i) => (
                    <div key={i} className="py-2 border-b border-border/40 last:border-0 hover:bg-muted/30 rounded-lg px-2 transition">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${shareColors[i % shareColors.length]} shadow-sm`} />
                          <span className="text-base font-bold font-cairo text-card-foreground">{r.label}</span>
                        </div>
                        <div className={`text-left`}>
                          <p className="text-base font-bold font-cairo text-primary">
                            {r.share.toLocaleString(lang === "ar" ? "ar-u-nu-latn" : "en-US", { minimumFractionDigits: 2 })} {currSymbol}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground font-cairo">
                        <span>{r.explanation}</span>
                        <span className="font-bold bg-muted px-2 py-0.5 rounded-full">{r.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculation Steps Button */}
                <button
                  onClick={() => setShowInfoModal({
                    isOpen: true,
                    title: lang === "ar" ? "تفاصيل الحساب" : "Calculation Details",
                    content: result.calculations.map((c, idx) => `${idx + 1}. ${c.step}: ${c.details}`).join("\n\n")
                  })}
                  className="w-full py-3 mt-4 text-sm font-cairo font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Info size={16} />
                  {lang === "ar" ? "عرض تفاصيل وأدلة الحساب" : "Show Calculation Details"}
                </button>

                {/* Save to History Button */}
                <button
                  onClick={handleSaveResult}
                  className="w-full py-3 mt-3 bg-muted hover:bg-muted/80 text-foreground text-sm font-bold font-cairo rounded-xl transition active:scale-95"
                >
                  {lang === "ar" ? "حفظ في السجل" : "Save to History"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <CurrencyModal
        isOpen={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        selectedCurrency={currency}
        onSelect={setCurrency}
      />

      <AppModal
        isOpen={showInfoModal.isOpen}
        onClose={() => setShowInfoModal({ ...showInfoModal, isOpen: false })}
        title={showInfoModal.title}
        showConfirmButton={false}
        position="center"
      >
        <div className="whitespace-pre-line text-sm text-muted-foreground font-cairo leading-relaxed bg-muted/50 p-4 rounded-xl border border-border">
          {showInfoModal.content}
        </div>
      </AppModal>

      <BottomNav />

      <ConfirmationModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={confirmSave}
        title={lang === "ar" ? "حفظ الحساب" : "Save Calculation"}
        message={lang === "ar" ? "هل تريد حفظ هذه العملية في السجل؟" : "Do you want to save this calculation to history?"}
        confirmText={lang === "ar" ? "حفظ" : "Save"}
        cancelText={lang === "ar" ? "إلغاء" : "Cancel"}
      />

      <ConfirmationModal
        isOpen={showSaveSuccess}
        onClose={() => setShowSaveSuccess(false)}
        title={lang === "ar" ? "تم الحفظ" : "Saved"}
        message={lang === "ar" ? "تم حفظ نتيجة الميراث في السجل بنجاح" : "Inheritance result saved to history successfully"}
        iconVariant="success"
        showCancelButton={false}
      />

      <ConfirmationModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
        iconVariant="destructive"
        showCancelButton={false}
        confirmText={lang === "ar" ? "حسناً" : "OK"}
      />

      <HeirSelectorModal
        isOpen={selectorModal.isOpen}
        onClose={() => setSelectorModal({ ...selectorModal, isOpen: false })}
        heirs={UI_HEIRS}
        onSelect={(type) => {
          if (selectorModal.rowIndex !== null) {
            updateHeirType(selectorModal.rowIndex, type);
          }
        }}
      />
    </div>
  );
});

InheritanceCalculator.displayName = "InheritanceCalculator";

export default InheritanceCalculator;