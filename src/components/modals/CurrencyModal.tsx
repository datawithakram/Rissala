import React, { useState } from "react";
import { Search } from "lucide-react";
import AppModal from "./AppModal";
import { useLanguage } from "@/contexts/LanguageContext";

export interface Currency {
  id: string;
  label: { ar: string; en: string };
  symbol: { ar: string; en: string };
  flag: string;
}

export const currencies: Currency[] = [
  { id: "SAR", label: { ar: "ريال سعودي", en: "Saudi Riyal" }, symbol: { ar: "ر.س", en: "SAR" }, flag: "🇸🇦" },
  { id: "USD", label: { ar: "دولار أمريكي", en: "US Dollar" }, symbol: { ar: "$", en: "$" }, flag: "🇺🇸" },
  { id: "EUR", label: { ar: "يورو", en: "Euro" }, symbol: { ar: "€", en: "€" }, flag: "🇪🇺" },
  { id: "GBP", label: { ar: "جنيه إسترليني", en: "British Pound" }, symbol: { ar: "£", en: "£" }, flag: "🇬🇧" },
  { id: "AED", label: { ar: "درهم إماراتي", en: "UAE Dirham" }, symbol: { ar: "د.إ", en: "AED" }, flag: "🇦🇪" },
  { id: "KWD", label: { ar: "دينار كويتي", en: "Kuwaiti Dinar" }, symbol: { ar: "د.ك", en: "KWD" }, flag: "🇰🇼" },
  { id: "QAR", label: { ar: "ريال قطري", en: "Qatari Riyal" }, symbol: { ar: "ر.ق", en: "QAR" }, flag: "🇶🇦" },
  { id: "OMR", label: { ar: "ريال عماني", en: "Omani Rial" }, symbol: { ar: "ر.ع.", en: "OMR" }, flag: "🇴🇲" },
  { id: "BHD", label: { ar: "دينار بحريني", en: "Bahraini Dinar" }, symbol: { ar: "د.ب.", en: "BHD" }, flag: "🇧🇭" },
  { id: "EGP", label: { ar: "جنيه مصري", en: "Egyptian Pound" }, symbol: { ar: "ج.م", en: "EGP" }, flag: "🇪🇬" },
  { id: "MAD", label: { ar: "درهم مغربي", en: "Moroccan Dirham" }, symbol: { ar: "د.م.", en: "MAD" }, flag: "🇲🇦" },
  { id: "DZD", label: { ar: "دينار جزائري", en: "Algerian Dinar" }, symbol: { ar: "د.ج", en: "DZD" }, flag: "🇩🇿" },
  { id: "TND", label: { ar: "دينار تونسي", en: "Tunisian Dinar" }, symbol: { ar: "د.ت", en: "TND" }, flag: "🇹🇳" },
  { id: "LYD", label: { ar: "دينار ليبي", en: "Libyan Dinar" }, symbol: { ar: "ل.د", en: "LYD" }, flag: "🇱🇾" },
  { id: "TRY", label: { ar: "ليرة تركية", en: "Turkish Lira" }, symbol: { ar: "₺", en: "TRY" }, flag: "🇹🇷" },
  { id: "JPY", label: { ar: "ين ياباني", en: "Japanese Yen" }, symbol: { ar: "¥", en: "JPY" }, flag: "🇯🇵" },
  { id: "CNY", label: { ar: "يوان صيني", en: "Chinese Yuan" }, symbol: { ar: "¥", en: "CNY" }, flag: "🇨🇳" },
  { id: "CAD", label: { ar: "دولار كندي", en: "Canadian Dollar" }, symbol: { ar: "$", en: "CAD" }, flag: "🇨🇦" },
  { id: "AUD", label: { ar: "دولار أسترالي", en: "Australian Dollar" }, symbol: { ar: "$", en: "AUD" }, flag: "🇦🇺" },
  { id: "INR", label: { ar: "روبية هندية", en: "Indian Rupee" }, symbol: { ar: "₹", en: "INR" }, flag: "🇮🇳" },
  { id: "PKR", label: { ar: "روبية باكستانية", en: "Pakistani Rupee" }, symbol: { ar: "₨", en: "PKR" }, flag: "🇵🇰" },
  { id: "IDR", label: { ar: "روبية إندونيسية", en: "Indonesian Rupiah" }, symbol: { ar: "Rp", en: "IDR" }, flag: "🇮🇩" },
  { id: "MYR", label: { ar: "رينغيت ماليزي", en: "Malaysian Ringgit" }, symbol: { ar: "RM", en: "MYR" }, flag: "🇲🇾" },
  { id: "NGN", label: { ar: "نايرا نيجيري", en: "Nigerian Naira" }, symbol: { ar: "₦", en: "NGN" }, flag: "🇳🇬" },
  { id: "ZAR", label: { ar: "راند جنوب أفريقيا", en: "South African Rand" }, symbol: { ar: "R", en: "ZAR" }, flag: "🇿🇦" },
  { id: "BRL", label: { ar: "ريال برازيلي", en: "Brazilian Real" }, symbol: { ar: "R$", en: "BRL" }, flag: "🇧🇷" },
  { id: "RUB", label: { ar: "روبل روسي", en: "Russian Ruble" }, symbol: { ar: "₽", en: "RUB" }, flag: "🇷🇺" },
  { id: "CHF", label: { ar: "فرنك سويسري", en: "Swiss Franc" }, symbol: { ar: "CHF", en: "CHF" }, flag: "🇨🇭" },
  { id: "SGD", label: { ar: "دولار سنغافوري", en: "Singapore Dollar" }, symbol: { ar: "$", en: "SGD" }, flag: "🇸🇬" },
  { id: "HKD", label: { ar: "دولار هونج كونج", en: "Hong Kong Dollar" }, symbol: { ar: "$", en: "HKD" }, flag: "🇭🇰" },
  { id: "KRW", label: { ar: "وون كوري جنوبي", en: "South Korean Won" }, symbol: { ar: "₩", en: "KRW" }, flag: "🇰🇷" },
  { id: "MXN", label: { ar: "بيزو مكسيكي", en: "Mexican Peso" }, symbol: { ar: "$", en: "MXN" }, flag: "🇲🇽" },
  { id: "SEK", label: { ar: "كرونة سويدية", en: "Swedish Krona" }, symbol: { ar: "kr", en: "SEK" }, flag: "🇸🇪" },
  { id: "NZD", label: { ar: "دولار نيوزيلندي", en: "New Zealand Dollar" }, symbol: { ar: "$", en: "NZD" }, flag: "🇳🇿" },
  { id: "PHP", label: { ar: "بيزو فلبيني", en: "Philippine Peso" }, symbol: { ar: "₱", en: "PHP" }, flag: "🇵🇭" },
  { id: "THB", label: { ar: "بات تايلاندي", en: "Thai Baht" }, symbol: { ar: "฿", en: "THB" }, flag: "🇹🇭" },
  { id: "PKR", label: { ar: "روبية باكستانية", en: "Pakistani Rupee" }, symbol: { ar: "₨", en: "PKR" }, flag: "🇵🇰" },
  { id: "KES", label: { ar: "شلن كينيا", en: "Kenyan Shilling" }, symbol: { ar: "KSh", en: "KES" }, flag: "🇰🇪" },
  { id: "GHS", label: { ar: "سيدي غانا", en: "Ghanaian Cedi" }, symbol: { ar: "GH₵", en: "GHS" }, flag: "🇬🇭" },
];

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: string;
  onSelect: (currencyId: string) => void;
}

const CurrencyModal: React.FC<CurrencyModalProps> = ({
  isOpen,
  onClose,
  selectedCurrency,
  onSelect,
}) => {
  const { lang, isRTL } = useLanguage();
  const [search, setSearch] = useState("");

  const filtered = currencies.filter((c) =>
    c.label[lang].toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleClose = () => {
    setSearch("");
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title={lang === "ar" ? "اختر العملة" : "Select Currency"}
      size="medium"
      showConfirmButton={false}
    >
      <div className="flex flex-col h-[60vh] sm:h-auto">
        <div className="relative mb-5 shrink-0 px-1">
          <Search
            size={18}
            className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-muted-foreground`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "ar" ? "ابحث عن عملة..." : "Search currency..."}
            className={`w-full ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"} py-2.5 rounded-2xl bg-muted/40 text-foreground text-sm font-cairo border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm`}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-2 pb-6">
          {filtered.map((c) => {
            const isSelected = selectedCurrency === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(c.id);
                  handleClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border border-primary/20 hover:bg-primary/20"
                    : "bg-background hover:bg-muted border border-border/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{c.flag}</span>
                  <div className="flex flex-col items-start">
                    <span className={`text-sm font-cairo font-medium ${isSelected ? "text-primary dark:text-primary-foreground" : "text-card-foreground"}`}>
                      {c.label[lang]}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-cairo">
                      {c.id} ({c.symbol[lang]})
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <span className="text-xs text-primary font-cairo font-bold bg-primary/10 px-2 py-1 rounded-md">
                    ✓ {lang === "ar" ? "المختارة" : "Selected"}
                  </span>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground font-cairo">
                {lang === "ar" ? "لا توجد نتائج" : "No results found"}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default CurrencyModal;
