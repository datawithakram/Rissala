import { ArrowLeft, Trash2, Calculator, Scale, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/contexts/LanguageContext";
import ConfirmationModal from "@/components/modals/ConfirmationModal";

export interface HistoryItem {
  id: string;
  type: "zakat" | "inheritance";
  amount: number;
  result: number;
  details: string;
  date: string;
}

const HISTORY_KEY = "calculation_history";

export const saveCalculation = (item: Omit<HistoryItem, "id" | "date">) => {
  const history: HistoryItem[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  history.unshift({
    ...item,
    id: Date.now().toString(),
    date: new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" }),
  });
  if (history.length > 50) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

const CalculationHistory = () => {
  const { t, isRTL, lang } = useLanguage();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"));
  }, []);

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-primary text-primary-foreground px-5 pt-10 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/profile" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition">
            <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          </Link>
          <h1 className="text-xl font-bold font-amiri">{t("history.title")}</h1>
        </div>
      </div>

      <div className="px-5 mt-6">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText size={36} className="text-muted-foreground" />
            </div>
            <p className="text-base font-bold font-cairo text-card-foreground">{t("history.empty")}</p>
            <p className="text-sm text-muted-foreground font-cairo mt-2 text-center max-w-[250px]">
              {t("history.empty.desc")}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold font-cairo text-muted-foreground">
                {history.length} {isRTL ? "عملية" : "calculations"}
              </p>
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-1 text-destructive text-xs font-cairo hover:opacity-80 transition"
              >
                <Trash2 size={14} />
                {t("history.clear")}
              </button>
            </div>
            <div className="space-y-3">
              {history.map((item, i) => (
                <div
                  key={item.id}
                  className="card-islamic animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.type === "zakat" ? "bg-emerald-light" : "bg-muted"
                    }`}>
                      {item.type === "zakat" ? (
                        <Calculator size={18} className="text-primary" />
                      ) : (
                        <Scale size={18} className="text-accent" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold font-cairo text-card-foreground">
                        {item.type === "zakat" ? t("history.zakat") : t("history.inheritance")}
                      </p>
                      <p className="text-xs text-muted-foreground font-cairo mt-0.5">{item.details}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[11px] text-muted-foreground font-cairo">
                          {t("history.amount")}: {item.amount.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-bold text-primary font-cairo">
                          {t("history.result")}: {item.result.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{item.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={clearHistory}
        title={lang === "ar" ? "مسح السجل" : "Clear History"}
        message={lang === "ar" ? "هل أنت متأكد من مسح جميع سجلات الحسابات؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to clear all calculation history? This action cannot be undone."}
        isDestructive={true}
        confirmText={lang === "ar" ? "مسح" : "Clear"}
      />

      <BottomNav />
    </div>
  );
};

export default CalculationHistory;
