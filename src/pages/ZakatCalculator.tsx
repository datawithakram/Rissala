import React, { useState } from "react";
import { ArrowLeft, Calculator, Activity, Coins, Percent, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveCalculation } from "@/pages/CalculationHistory";
import CurrencyModal, { currencies } from "@/components/modals/CurrencyModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { 
  calculateZakatMoney, 
  calculateZakatGold, 
  calculateZakatAssets, 
  calculateZakatCamels,
  calculateZakatCattle,
  calculateZakatSheep,
  GOLD_PRICE_PER_GRAM_DEFAULT 
} from "@/services/zakatUtils";
import AppModal from "@/components/modals/AppModal";

const ZakatCalculator = React.forwardRef<HTMLDivElement>((_, ref) => {
  const { isRTL, lang } = useLanguage();
  
  // Tabs
  const [activeTab, setActiveTab] = useState<"money" | "gold" | "assets" | "livestock">("money");

  // State
  const [currency, setCurrency] = useState("SAR");
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [goldPrice, setGoldPrice] = useState(GOLD_PRICE_PER_GRAM_DEFAULT);
  const [isEditingGoldPrice, setIsEditingGoldPrice] = useState(false);
  const [tempGoldPrice, setTempGoldPrice] = useState(GOLD_PRICE_PER_GRAM_DEFAULT.toString());

  const currSymbol = currencies.find(c => c.id === currency)?.symbol[lang] || currency;

  // Inputs
  const [moneyAmount, setMoneyAmount] = useState("");
  const [goldWeight, setGoldWeight] = useState("");
  const [goldPurity, setGoldPurity] = useState<24 | 21 | 18>(24);
  const [stocksAmount, setStocksAmount] = useState("");
  const [realEstateAmount, setRealEstateAmount] = useState("");
  
  // Livestock inputs
  const [livestockType, setLivestockType] = useState<"camels" | "cattle" | "sheep">("sheep");
  const [livestockCount, setLivestockCount] = useState("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<any>(null);

  const confirmSave = () => {
    if (pendingSaveData) {
      const { result, type, amount } = pendingSaveData;
      saveCalculation({
        type: "zakat",
        amount: amount,
        result: typeof result.due === 'object' ? 0 : (result.zakatAmount || result.zakatAmountGoldGrams || 0),
        details: `${type}: ${typeof result.due === 'object' ? result.due[lang] : (result.zakatAmount || result.zakatAmountGoldGrams || 0).toLocaleString() + ' ' + currSymbol}`,
      });
      setShowSaveConfirm(false);
      setShowSaveSuccess(true);
      setPendingSaveData(null);
    }
  };

  const handleSaveResult = (result: any, type: string, amount: number) => {
    setPendingSaveData({ result, type, amount });
    setShowSaveConfirm(true);
  };

  const ResultCard = ({ result, amount, type, isLivestock = false }: { result: any, amount: number, type: string, isLivestock?: boolean }) => {
    if (!result) return null;

    return (
      <div className="card-islamic animate-scale-in border border-border mt-6">
        <h3 className="text-lg font-bold font-cairo text-card-foreground mb-4 pb-2 border-b border-border/50 flex items-center justify-between">
          {lang === "ar" ? "نتيجة الزكاة" : "Zakat Result"}
          <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">{type}</span>
        </h3>
        
        {result.isEligible ? (
          <div className="space-y-4">
            <div className={`border p-4 rounded-xl flex items-center justify-between ${isLivestock ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/20'}`}>
              <div>
                <p className={`text-xs font-bold font-cairo mb-1 text-primary italic`}>
                  {isLivestock 
                    ? (lang === "ar" ? "الزكاة الواجبة" : "Due Zakat")
                    : (lang === "ar" ? "قيمة الزكاة المستحقة (2.5%)" : "Due Zakat (2.5%)")}
                </p>
                <p className="text-2xl font-bold font-cairo text-primary">
                  {isLivestock 
                    ? result.due[lang] 
                    : `${(result.zakatAmount || result.zakatAmountGoldGrams)?.toLocaleString(lang === "ar" ? "ar-u-nu-latn" : "en-US", { minimumFractionDigits: 2 })} ${result.zakatAmountGoldGrams ? (lang === 'ar' ? 'جرام' : 'Grams') : currSymbol}`}
                </p>
              </div>
              <Percent size={32} className="text-primary opacity-40" />
            </div>

            {!isLivestock && (
              <p className="text-[10px] text-muted-foreground font-cairo text-center italic">
                {lang === "ar" 
                  ? `أُحتسب بناءً على سعر جرام ذهب: ${goldPrice} ${currSymbol}` 
                  : `Calculated based on gold price: ${goldPrice} ${currSymbol}/g`}
              </p>
            )}

            <button
               onClick={() => handleSaveResult(result, type, amount)}
               className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground text-sm font-bold font-cairo rounded-xl transition active:scale-95"
            >
               {lang === "ar" ? "حفظ في السجل" : "Save to History"}
            </button>
          </div>
        ) : (
          <div className="bg-destructive/5 border border-destructive/10 p-4 rounded-xl text-center space-y-2">
            <p className="text-base font-bold font-cairo text-destructive">
              {lang === "ar" ? "لم تبلغ النصاب الشرعي" : "Below Nisab threshold"}
            </p>
            {!isLivestock && (
              <p className="text-xs font-cairo text-muted-foreground">
                {lang === "ar" 
                  ? `النصاب الحالي: ${result.nisabValue?.toLocaleString("ar-u-nu-latn") || result.nisabThreshold} ${result.nisabValue ? currSymbol : 'جرام'}` 
                  : `Current Nisab: ${result.nisabValue?.toLocaleString("en-US") || result.nisabThreshold} ${result.nisabValue ? currSymbol : 'Grams'}`}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleMoneyZakat = () => {
    const val = parseFloat(moneyAmount);
    if (isNaN(val) || val <= 0) return null;
    return calculateZakatMoney(val, goldPrice);
  };

  const handleGoldZakat = () => {
    const val = parseFloat(goldWeight);
    if (isNaN(val) || val <= 0) return null;
    return calculateZakatGold(val, goldPurity);
  };

  const handleAssetsZakat = () => {
    const s = parseFloat(stocksAmount) || 0;
    const r = parseFloat(realEstateAmount) || 0;
    if (s + r <= 0) return null;
    return calculateZakatAssets(s, r, goldPrice);
  };

  const handleLivestockCalculate = () => {
    const count = parseInt(livestockCount);
    if (isNaN(count) || count <= 0) return null;
    switch (livestockType) {
      case "camels": return calculateZakatCamels(count);
      case "cattle": return calculateZakatCattle(count);
      case "sheep": return calculateZakatSheep(count);
      default: return null;
    }
  };

  return (
    <div ref={ref} className="min-h-screen bg-background pb-24">
      {/* Header - Updated to match unified primary theme */}
      <div className="gradient-primary text-white px-5 pt-10 pb-10 rounded-b-[2.5rem] relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition backdrop-blur-md border border-white/10 shadow-inner">
              <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
            </Link>
            <h1 className="text-2xl font-bold font-amiri tracking-wide">
              {lang === "ar" ? "حاسبة الزكاة" : "Zakat Calculator"}
            </h1>
          </div>
          <button 
            onClick={() => {
              setTempGoldPrice(goldPrice.toString());
              setIsEditingGoldPrice(true);
            }}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/5"
            title={lang === "ar" ? "تعديل سعر الذهب" : "Edit Gold Price"}
          >
            <Settings2 size={18} />
          </button>
        </div>
        <p className="text-xs opacity-80 font-cairo max-w-[80%] leading-relaxed">
          {lang === "ar" ? "أداة دقيقة لحساب الزكاة الشرعية لمختلف أنواع الأموال والمدخرات والأنعام" : "A precise tool to calculate Zakat for money, savings, gold, and livestock."}
        </p>
      </div>

      <div className="px-5 -mt-6 relative z-20">
        <div className="bg-card rounded-2xl p-1.5 flex shadow-xl border border-border overflow-x-auto no-scrollbar">
          {[
            { id: "money", label: lang === "ar" ? "المال" : "Money", icon: Coins },
            { id: "gold", label: lang === "ar" ? "الذهب" : "Gold", icon: Calculator },
            { id: "assets", label: lang === "ar" ? "الأصول" : "Assets", icon: Activity },
            { id: "livestock", label: lang === "ar" ? "الأنعام" : "Livestock", icon: Activity },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[80px] py-3 rounded-xl font-bold text-xs font-cairo transition-all flex flex-col items-center justify-center gap-1.5 ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-6 space-y-4">
        
        {activeTab === "money" && (
          <div className="animate-fade-up">
            <div className="card-islamic space-y-4">
              <div className="flex justify-between items-center mb-1">
                 <label className="text-xs font-bold font-cairo text-muted-foreground uppercase tracking-wider">
                  {lang === "ar" ? "رأس المال (النقد)" : "Available Cash"}
                 </label>
                 <button onClick={() => setShowCurrencyModal(true)} className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors">
                    <span className="text-xs">{currencies.find(c => c.id === currency)?.flag}</span>
                    <span>{currencies.find((c) => c.id === currency)?.label[lang]} ({currSymbol})</span>
                 </button>
              </div>

              <div className="relative group">
                <div className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 font-bold text-primary transition-transform group-focus-within:scale-110`}>{currSymbol}</div>
                <input
                  type="number"
                  value={moneyAmount}
                  onChange={(e) => setMoneyAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full bg-muted/30 rounded-2xl py-5 text-2xl font-bold font-cairo text-card-foreground outline-none border-2 border-transparent focus:border-primary/30 transition shadow-inner ${isRTL ? 'pr-12' : 'pl-12'}`}
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-xl flex items-start gap-3 text-[10px] text-muted-foreground font-cairo border border-border/50">
                 <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Activity size={12} className="text-primary" />
                 </div>
                 <p>{lang === "ar" ? `النصاب الشرعي للمال هو قيمة 85 جرام من الذهب الخالص (عيار 24).` : `Nisab is equivalent to the value of 85g of pure gold (24k).`}</p>
              </div>
            </div>
            {moneyAmount && <ResultCard result={handleMoneyZakat()} amount={parseFloat(moneyAmount)} type={lang === 'ar' ? 'زكاة المال' : 'Money Zakat'} />}
          </div>
        )}

        {activeTab === "gold" && (
          <div className="animate-fade-up">
            <div className="card-islamic space-y-4">
               <label className="text-xs font-bold font-cairo text-muted-foreground uppercase tracking-wider block">
                  {lang === "ar" ? "إجمالي وزن الذهب" : "Total Gold Weight"}
               </label>
               <div className="relative">
                  <input
                    type="number"
                    value={goldWeight}
                    onChange={(e) => setGoldWeight(e.target.value)}
                    placeholder="0"
                    className="w-full bg-muted/30 rounded-2xl px-5 py-5 text-2xl font-bold font-cairo text-card-foreground outline-none border-2 border-transparent focus:border-primary/30 transition shadow-inner"
                  />
                  <span className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground`}>
                    {lang === "ar" ? "جرام" : "g"}
                  </span>
               </div>

               <label className="text-xs font-bold font-cairo text-muted-foreground uppercase tracking-wider block pt-2">
                  {lang === "ar" ? "عيار الذهب" : "Gold Purity"}
               </label>
               <div className="flex gap-2.5">
                 {[24, 21, 18].map(p => (
                   <button 
                     key={p} 
                     onClick={() => setGoldPurity(p as any)}
                     className={`flex-1 py-3.5 rounded-xl font-bold text-sm border-2 transition-all ${goldPurity === p ? 'border-primary bg-primary text-primary-foreground shadow-md' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
                   >
                     {p}k
                   </button>
                 ))}
               </div>
            </div>
            {goldWeight && <ResultCard result={handleGoldZakat()} amount={parseFloat(goldWeight)} type={lang === 'ar' ? 'زكاة الذهب' : 'Gold Zakat'} />}
          </div>
        )}

        {activeTab === "assets" && (
           <div className="animate-fade-up">
             <div className="card-islamic space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold font-cairo text-muted-foreground uppercase tracking-wider flex justify-between">
                    <span>{lang === "ar" ? "قيمة الأسهم" : "Stocks Value"}</span>
                  </label>
                  <div className="relative">
                    <input
                        type="number"
                        value={stocksAmount}
                        onChange={(e) => setStocksAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-muted/30 rounded-xl px-4 py-3.5 text-lg font-bold font-cairo text-card-foreground outline-none border-2 border-transparent focus:border-primary/30 transition"
                      />
                    <span className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-xs font-bold text-primary/50`}>{currSymbol}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold font-cairo text-muted-foreground uppercase tracking-wider flex justify-between">
                    <span>{lang === "ar" ? "صافي إيرادات العقارات" : "RE Net Income"}</span>
                  </label>
                  <div className="relative">
                    <input
                        type="number"
                        value={realEstateAmount}
                        onChange={(e) => setRealEstateAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-muted/30 rounded-xl px-4 py-3.5 text-lg font-bold font-cairo text-card-foreground outline-none border-2 border-transparent focus:border-primary/30 transition"
                      />
                    <span className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-xs font-bold text-primary/50`}>{currSymbol}</span>
                  </div>
                </div>
             </div>
             {(stocksAmount || realEstateAmount) && <ResultCard result={handleAssetsZakat()} amount={parseFloat(stocksAmount||'0') + parseFloat(realEstateAmount||'0')} type={lang === 'ar' ? 'زكاة الأصول' : 'Assets Zakat'} />}
           </div>
        )}

        {activeTab === "livestock" && (
          <div className="animate-fade-up">
            <div className="card-islamic space-y-5 text-left">
              <label className="text-xs font-bold font-cairo text-muted-foreground uppercase tracking-wider block">
                {lang === "ar" ? "نوع الأنعام" : "Livestock Type"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "camels", ar: "إبل", en: "Camels" },
                  { id: "cattle", ar: "بقر", en: "Cattle" },
                  { id: "sheep", ar: "غنم/ماعز", en: "Sheep" },
                ].map(type => (
                  <button 
                    key={type.id}
                    onClick={() => setLivestockType(type.id as any)}
                    className={`py-3 px-1 rounded-xl font-bold text-xs font-cairo transition-all border-2 ${livestockType === type.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground'}`}
                  >
                    {lang === "ar" ? type.ar : type.en}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold font-cairo text-muted-foreground uppercase tracking-wider block">
                  {lang === "ar" ? "العدد الإجمالي (السائمة)" : "Total Count (Free-grazing)"}
                </label>
                <input
                  type="number"
                  value={livestockCount}
                  onChange={(e) => setLivestockCount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-muted/30 rounded-2xl px-5 py-4 text-2xl font-bold font-cairo text-card-foreground border-2 border-transparent focus:border-primary/30 transition outline-none"
                />
              </div>
            </div>
            {livestockCount && <ResultCard result={handleLivestockCalculate()} amount={parseInt(livestockCount)} type={lang === 'ar' ? 'زكاة الأنعام' : 'Livestock Zakat'} isLivestock={true} />}
          </div>
        )}

      </div>

      {/* Manual Gold Price Modal */}
      <AppModal
        isOpen={isEditingGoldPrice}
        onClose={() => setIsEditingGoldPrice(false)}
        title={lang === "ar" ? "تعديل سعر الذهب" : "Adjust Gold Price"}
        position="center"
        size="small"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm font-cairo text-muted-foreground">
            {lang === "ar" ? "أدخل سعر جرام الذهب الحالي (عيار 24) لحساب النصاب بدقة:" : "Enter current gold price per gram (24k) for precise Nisab calculation:"}
          </p>
          <div className="relative">
             <input
               type="number"
               value={tempGoldPrice}
               onChange={(e) => setTempGoldPrice(e.target.value)}
               className="w-full bg-muted rounded-xl px-4 py-4 text-xl font-bold font-cairo text-card-foreground border-2 border-primary/20 outline-none focus:border-primary transition"
               autoFocus
             />
             <span className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 font-bold text-primary`}>{currSymbol}</span>
          </div>
          <button
            onClick={() => {
              const val = parseFloat(tempGoldPrice);
              if (!isNaN(val) && val > 0) {
                setGoldPrice(val);
                setIsEditingGoldPrice(false);
              }
            }}
            className="w-full py-4 gradient-primary text-white font-bold font-cairo rounded-xl shadow-lg active:scale-95 transition"
          >
            {lang === "ar" ? "تحديث السعر" : "Update Price"}
          </button>
        </div>
      </AppModal>

      <CurrencyModal
        isOpen={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        selectedCurrency={currency}
        onSelect={setCurrency}
      />
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
        message={lang === "ar" ? "تم حفظ الحساب في السجل بنجاح" : "The calculation has been saved to history successfully"}
        iconVariant="success"
        showCancelButton={false}
      />
    </div>
  );
});

ZakatCalculator.displayName = "ZakatCalculator";

export default ZakatCalculator;