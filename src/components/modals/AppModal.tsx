import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showConfirmButton?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  size?: "small" | "medium" | "large";
  position?: "bottom" | "center";
}

const AppModal: React.FC<AppModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showConfirmButton = false,
  confirmText,
  cancelText,
  onConfirm,
  size = "medium",
  position = "bottom",
}) => {
  const { lang, isRTL } = useLanguage();

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: "max-w-xs", // جعلناه أصغر من max-w-sm
    medium: "max-w-lg",
    large: "max-w-2xl",
  };

  const cText = confirmText || (lang === "ar" ? "تأكيد" : "Confirm");
  const cxText = cancelText || (lang === "ar" ? "إلغاء" : "Cancel");

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center bg-foreground/40 backdrop-blur-sm ${
        position === "center" ? "justify-center p-4" : "justify-end sm:justify-center"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full ${sizeClasses[size]} bg-card p-5 sm:p-6 max-h-[85vh] flex flex-col animate-fade-up shadow-2xl relative overflow-hidden ${
          position === "center" ? "rounded-3xl" : "rounded-t-3xl sm:rounded-3xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
          <h2 className="text-lg font-bold font-cairo text-card-foreground">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted transition text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 custom-scrollbar pr-2 mb-2">
          {children}
        </div>

        {/* Footer Buttons */}
        {(showConfirmButton || onConfirm) && (
          <div className="flex items-center gap-3 pt-4 border-t border-border/50 mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-muted text-card-foreground font-cairo font-semibold transition hover:bg-muted/80 active:scale-95"
            >
              {cxText}
            </button>
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
              }}
              className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-cairo font-bold transition shadow-lg hover:shadow-xl active:scale-95"
            >
              {cText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppModal;
