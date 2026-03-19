import React, { useState, useEffect } from "react";
import { ArrowLeft, Navigation, RefreshCw, Info, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Motion } from '@capacitor/motion';
import { Capacitor } from '@capacitor/core';

const Qibla = () => {
  const { t, isRTL, lang } = useLanguage();
  const { city, refreshLocation, loading: locLoading } = usePrayerTimes();
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);

  const [isWeb, setIsWeb] = useState(Capacitor.getPlatform() === 'web');
  const [needsPermission, setNeedsPermission] = useState(false);

  // Kaaba Coordinates
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  useEffect(() => {
    // Get stored coordinates
    const lat = parseFloat(localStorage.getItem("prayer_latitude") || "21.4225");
    const lng = parseFloat(localStorage.getItem("prayer_longitude") || "39.8262");

    // Calculate Qibla Direction (Great Circle)
    const calculateQibla = (lat1: number, lng1: number) => {
      const phi1 = lat1 * (Math.PI / 180);
      const lambda1 = lng1 * (Math.PI / 180);
      const phi2 = KAABA_LAT * (Math.PI / 180);
      const lambda2 = KAABA_LNG * (Math.PI / 180);

      const y = Math.sin(lambda2 - lambda1);
      const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(lambda2 - lambda1);
      let qibla = Math.atan2(y, x) * (180 / Math.PI);
      return (qibla + 360) % 360;
    };

    // Calculate Geodesic Distance (Haversine)
    const calculateDistance = (lat1: number, lng1: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = (KAABA_LAT - lat1) * (Math.PI / 180);
      const dLng = (KAABA_LNG - lng1) * (Math.PI / 180);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * (Math.PI/180)) * Math.cos(KAABA_LAT * (Math.PI/180)) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    setQiblaDirection(calculateQibla(lat, lng));
    setDistance(calculateDistance(lat, lng));
  }, [city]);

  const requestPermission = async () => {
    // Handling iOS specific permission
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setNeedsPermission(false);
          startCompass();
        } else {
          setError(lang === 'ar' ? 'تم رفض الوصول للحساسات' : 'Sensor access denied');
        }
      } catch (e) {
        console.error('Permission request error:', e);
      }
    } else {
      // For Android or platforms that don't need requestPermission
      setNeedsPermission(false);
      startCompass();
    }
  };

  const startCompass = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    const handler = (event: any) => {
      let webkitHeading = event.webkitCompassHeading;
      let absoluteHeading = event.alpha;

      if (isIOS && webkitHeading !== undefined) {
        // iOS provides webkitCompassHeading which is absolute
        setHeading(webkitHeading);
        setIsCalibrated(true);
      } else if (event.absolute && absoluteHeading !== null) {
        // Android/Chrome absolute orientation
        // Need to compensate based on device orientation if necessary, 
        // but alpha usually works for portrait absolute
        setHeading(360 - absoluteHeading);
        setIsCalibrated(true);
      } else if (absoluteHeading !== null) {
        // Fallback to relative heading but mark as uncalibrated or show warning
        setHeading(360 - absoluteHeading);
        // We don't set isCalibrated to true here if we want to warn the user
        setIsCalibrated(true); 
      }
    };

    // Check for absolute event first (Android)
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handler, true);
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handler, true);
    }
  };

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (isIOS && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setNeedsPermission(true);
    } else {
      startCompass();
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', () => {});
      window.removeEventListener('deviceorientation', () => {});
    };
  }, []);

  // relative angle to point towards Qibla
  // When heading matches qiblaDirection, the result should be 0 (North pointing up)
  const relativeQibla = (qiblaDirection - heading + 360) % 360;
  const isCorrect = Math.abs(relativeQibla) < 3 || Math.abs(relativeQibla - 360) < 3;

  return (
    <div className="min-h-screen bg-background pb-24 overflow-hidden select-none">
      {/* Header */}
      <div className="gradient-primary text-primary-foreground px-5 pt-10 pb-8 rounded-b-[2.5rem] relative z-10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link to="/prayer" className="p-2.5 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 active:scale-95 transition-all">
              <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
            </Link>
            <h1 className="text-2xl font-bold font-amiri tracking-wide">{t("qibla")}</h1>
          </div>
          <button 
            onClick={() => refreshLocation()}
            className="p-2.5 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 active:rotate-180 transition-all duration-500"
          >
            <RefreshCw size={20} className={locLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10">
           <div className="flex flex-col gap-1">
             <div className="flex items-center gap-1.5 text-white/90 font-cairo text-sm font-semibold">
               <MapPin size={14} className="text-emerald-300" />
               <span className="truncate max-w-[150px]">{city}</span>
             </div>
             <p className="text-[11px] text-white/60 font-cairo">
                {lang === 'ar' ? 'موقعك الحالي' : 'Your current location'}
             </p>
           </div>
           <div className="text-right">
              <p className="text-xs text-white/60 font-cairo mb-0.5">{lang === 'ar' ? 'المسافة للكعبة' : 'Distance to Kaaba'}</p>
              <p className="text-sm font-bold font-cairo text-emerald-300">
                {Math.round(distance).toLocaleString()} {lang === 'ar' ? 'كم' : 'km'}
              </p>
           </div>
        </div>
      </div>

      {/* Compass UI */}
      <div className="flex-1 flex flex-col items-center justify-center pt-8 px-6">
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
          
          {/* Main Ring with glass effect */}
          <div className="absolute inset-0 rounded-full border-[1px] border-primary/20 bg-card/30 backdrop-blur-[2px] shadow-[0_0_50px_rgba(16,185,129,0.05)]" />
          
          {/* Decorative Outer Ticks */}
          <div className="absolute inset-[-10px] rounded-full border border-primary/5" />
          
          {/* Background Compass Card (Rotates with phone) */}
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out will-change-transform" 
            style={{ transform: `rotate(${-heading}deg)` }}
          >
             {/* North Marking */}
             <div className="absolute top-6 flex flex-col items-center">
                <span className="font-black text-xl text-primary drop-shadow-sm">N</span>
                <div className="w-0.5 h-3 bg-primary mt-1" />
             </div>
             
             {/* East/West/South */}
             <span className="absolute right-8 font-bold text-muted-foreground/60">E</span>
             <span className="absolute bottom-8 font-bold text-muted-foreground/60">S</span>
             <span className="absolute left-8 font-bold text-muted-foreground/60">W</span>
             
             {/* All-degree markings */}
             {[...Array(72)].map((_, i) => {
                const isMain = i % 9 === 0;
                const isMedium = i % 3 === 0 && !isMain;
                return (
                  <div key={i} className="absolute h-full w-[1px]" style={{ transform: `rotate(${i * 5}deg)` }}>
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 ${
                      isMain ? 'h-5 w-[2px] bg-primary/40' : 
                      isMedium ? 'h-3 w-[1px] bg-muted-foreground/30' : 
                      'h-1.5 w-[1px] bg-muted-foreground/10'
                    }`} />
                  </div>
                );
             })}
          </div>

          {/* Qibla Direction Arrow (Needle) */}
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out will-change-transform z-20" 
            style={{ transform: `rotate(${qiblaDirection - heading}deg)` }}
          >
             <div className="absolute top-[-5px] flex flex-col items-center group">
                {/* Kaaba Icon with Glow */}
                <div className={`w-14 h-14 bg-[#1A1A1A] rounded-2xl shadow-2xl flex items-center justify-center border-2 transition-all duration-300 backdrop-blur-md ${isCorrect ? 'border-primary border-4 scale-110 shadow-primary/30' : 'border-[#FFD700]/50'}`}>
                   <div className="relative w-10 h-10 flex items-center justify-center">
                      <div className="absolute top-2 w-full h-1.5 bg-[#FFD700]/80 shadow-[0_0_10px_rgba(255,215,0,0.4)]" />
                      <div className="w-4 h-4 border border-[#FFD700]/30 rounded-sm mt-2" />
                   </div>
                </div>
                {/* Direction Line */}
                <div className={`w-0.5 h-32 mt-2 bg-gradient-to-b transition-all duration-300 ${isCorrect ? 'from-primary to-transparent w-1' : 'from-[#FFD700]/40 to-transparent'}`} />
             </div>
          </div>

          {/* Center Display / Status */}
          <div className={`w-44 h-44 rounded-full bg-card shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center z-30 border transition-all duration-500 ${isCorrect ? 'border-primary/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-border/50'}`}>
            <span className="text-[10px] text-muted-foreground font-cairo uppercase tracking-wider mb-1">
              {lang === 'ar' ? 'زاوية القبلة' : 'Qibla Angle'}
            </span>
            <div className="flex items-center gap-1">
              <span className={`text-4xl font-black font-cairo ${isCorrect ? 'text-primary' : 'text-foreground'}`}>
                {Math.round(qiblaDirection)}°
              </span>
            </div>
            
            {isCorrect ? (
              <div className="mt-2 flex items-center gap-1.5 text-primary animate-pulse">
                 <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                 <span className="text-xs font-bold font-cairo">اتجاه دقيق</span>
              </div>
            ) : (
              <div className="mt-2 text-muted-foreground/40 font-cairo text-center">
                 <span className="text-[10px]">{lang === 'ar' ? 'قم بالدوران' : 'Please rotate'}</span>
              </div>
            )}
          </div>

          {/* Fixed Device Pointer (Top) */}
          <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 flex flex-col items-center z-40">
             <div className="w-1 h-10 bg-gradient-to-t from-red-500 to-red-400 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
             <div className="w-3 h-3 bg-red-500 rounded-full -mt-2 border-2 border-background shadow-lg" />
          </div>
        </div>

        {/* Action/Instruction Area */}
        <div className="mt-14 w-full max-w-sm px-4 min-h-[140px] flex items-center justify-center">
           {error ? (
             <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex items-start gap-3 w-full">
               <div className="p-2 bg-destructive/20 rounded-lg">
                 <Info size={18} className="text-destructive" />
               </div>
               <div>
                 <p className="font-bold text-destructive font-cairo text-sm">{lang === 'ar' ? 'تنبيه الجهاز' : 'Device Alert'}</p>
                 <p className="text-xs text-destructive/80 font-cairo mt-0.5 leading-relaxed">{error}</p>
               </div>
             </div>
           ) : isCorrect ? (
             <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl text-center transform scale-105 transition-transform w-full">
               <p className="text-primary font-bold font-cairo text-lg animate-bounce-slow">
                  {lang === 'ar' ? 'أنت تشير نحو القبلة الآن' : 'You are pointing to Qibla'}
               </p>
               <p className="text-[11px] text-primary/70 font-cairo mt-1">
                  {lang === 'ar' ? 'تقبل الله منا ومنكم صالح الأعمال' : 'May Allah accept from us and you'}
               </p>
             </div>
           ) : (
             <div className="bg-card border border-border/40 p-5 rounded-3xl flex flex-col items-center gap-3 w-full text-center">
               <div className="w-10 h-10 bg-secondary/30 rounded-full flex items-center justify-center animate-pulse">
                  <Navigation size={20} className="text-muted-foreground" />
               </div>
               <p className="text-sm text-muted-foreground font-cairo leading-relaxed px-2">
                  {needsPermission 
                    ? (lang === 'ar' ? 'يجب تفعيل الحساسات أولاً لرؤية اتجاه القبلة' : 'Please enable sensors to see Qibla direction')
                    : (lang === 'ar' ? 'قم بتدوير هاتفك حتى يتماشى رمز الكعبة مع الخط الأحمر العلوي' : 'Rotate your phone until the Kaaba icon aligns with the top red pointer')}
               </p>
               {!needsPermission && (
                 <div className="flex items-center gap-2 mt-2 opacity-50">
                    <div className="w-8 h-12 border-2 border-muted-foreground/30 rounded-md relative overflow-hidden">
                       <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-muted-foreground/30 rounded-full" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1 h-4 bg-muted-foreground/30 animate-spin-slow" />
                       </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">{lang === 'ar' ? 'حرك الجهاز' : 'Move Device'}</span>
                 </div>
               )}
             </div>
           )}
        </div>
      </div>

      {/* Accuracy Tip */}
      <div className="px-8 mt-10">
         <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl flex items-center gap-3">
            <div className="p-1.5 bg-primary/10 rounded-lg">
               <Info size={14} className="text-primary" />
            </div>
            <p className="text-[10px] text-muted-foreground/80 font-cairo leading-tight">
               {lang === 'ar' ? 'للحصول على دقة أكبر، ضع الهاتف على سطح مستوٍ بعيداً عن الأجهزة الإلكترونية والمغناطيسية.' : 'For better accuracy, place the phone on a flat surface away from electronic or magnetic devices.'}
            </p>
         </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Qibla;
