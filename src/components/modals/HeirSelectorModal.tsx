import React from "react";
import AppModal from "./AppModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { HeirType } from "@/services/inheritanceService";

interface HeirSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: HeirType) => void;
  heirs: { value: HeirType; label: { ar: string; en: string }; icon: string }[];
}

const HeirSelectorModal: React.FC<HeirSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  heirs,
}) => {
  const { lang, isRTL } = useLanguage();

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === "ar" ? "اختر الوارث" : "Select Heir"}
      size="medium"
      position="bottom"
    >
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
        {heirs.map((heir) => (
          <button
            key={heir.value}
            onClick={() => {
              onSelect(heir.value);
              onClose();
            }}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/50 hover:bg-primary/10 hover:ring-2 hover:ring-primary/20 transition-all active:scale-95 group border border-transparent hover:border-primary/10"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
              {heir.icon}
            </span>
            <span className="text-[10px] font-bold font-cairo text-card-foreground text-center line-clamp-1">
              {heir.label[lang]}
            </span>
          </button>
        ))}
      </div>
    </AppModal>
  );
};

export default HeirSelectorModal;
