import React from "react";
import { AlertTriangle, Trash2, CheckCircle2 } from "lucide-react";
import AppModal from "./AppModal";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  showCancelButton?: boolean;
  iconVariant?: "warning" | "destructive" | "success";
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  isDestructive = false,
  showCancelButton = true,
  iconVariant = "warning",
}) => {
  const { lang } = useLanguage();

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      position="center"
      showConfirmButton={false}
    >
      <div className="flex flex-col items-center text-center py-2 relative">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-inner relative ${
          isDestructive || iconVariant === "destructive" 
            ? 'bg-destructive/10 text-destructive' 
            : iconVariant === "success" 
              ? 'bg-emerald-500/10 text-emerald-500' 
              : 'bg-primary/10 text-primary'
        }`}>
          {/* Decorative Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-current opacity-10 animate-ping duration-[3s]" />
          
          {isDestructive || iconVariant === "destructive" ? (
            <Trash2 size={40} className="drop-shadow-sm" />
          ) : iconVariant === "success" ? (
            <CheckCircle2 size={40} className="drop-shadow-sm" />
          ) : (
            <AlertTriangle size={40} className="drop-shadow-sm" />
          )}
        </div>
        
        <p className="text-base text-card-foreground font-cairo mb-6 leading-relaxed px-2">
          {message}
        </p>
        
        <div className="w-full flex gap-3 mt-1">
          {showCancelButton && (
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-muted text-card-foreground font-cairo font-bold transition hover:bg-muted/80 active:scale-95 border border-border/50"
            >
              {cancelText || (lang === "ar" ? "لا" : "No")}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`flex-1 py-4 rounded-2xl font-cairo font-bold transition shadow-lg active:scale-95 ${
              isDestructive || iconVariant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20" 
                : iconVariant === "success"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20"
                  : "gradient-primary text-primary-foreground shadow-primary/20"
            }`}
          >
            {confirmText || (lang === "ar" ? (iconVariant === "success" ? "تم" : "نعم") : (iconVariant === "success" ? "Done" : "Yes"))}
          </button>
        </div>
      </div>
    </AppModal>
  );
};

export default ConfirmationModal;
