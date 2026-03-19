import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Calculator, Clock, BookOpen, User, Compass } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BottomNav = React.forwardRef<HTMLDivElement>((_, ref) => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: "/", icon: Home, label: t("home") },
    { path: "/zakat", icon: Calculator, label: t("zakat") },
    { path: "/prayer", icon: Clock, label: t("prayer") },
    { path: "/qibla", icon: Compass, label: t("qibla") },
    { path: "/azkar", icon: BookOpen, label: t("azkar") },
    { path: "/profile", icon: User, label: t("profile") },
  ];

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/50 backdrop-blur-lg bg-opacity-95">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-primary bg-emerald-light scale-105"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = "BottomNav";

export default BottomNav;
