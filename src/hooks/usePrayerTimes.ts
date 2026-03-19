import { useState, useEffect, useCallback } from "react";
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from "@/contexts/LanguageContext";

interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface HijriDate {
  date: string;
  day: string;
  month: string;
  monthNumber: number;
  year: string;
  weekday: string;
}

interface GregorianDate {
  date: string;
}

interface PrayerInfo {
  name: string;
  nameEn: string;
  time: string;
  time24: string;
  timestamp: Date;
}

interface UsePrayerTimesResult {
  prayers: PrayerInfo[];
  loading: boolean;
  error: string | null;
  city: string;
  currentPrayerIndex: number;
  nextPrayerTime: Date | null;
  hijriDate: HijriDate | null;
  gregorianDate: GregorianDate | null;
  calculationMethod: number;
  setCalculationMethod: (method: number) => void;
  refreshLocation: () => void;
  setManualLocation: (lat: number, lng: number, cityName: string) => void;
  locationSaved: boolean;
  isManualLocation: boolean;
  hijriAdjustment: number;
  setHijriAdjustment: (adj: number) => void;
}

const STORAGE_KEYS = {
  LATITUDE: "prayer_latitude",
  LONGITUDE: "prayer_longitude",
  LOCATION_SAVED: "prayer_location_saved",
  LAST_UPDATE: "prayer_last_update",
  CACHED_PRAYERS: "prayer_cached_data",
  CACHED_HIJRI: "prayer_cached_hijri",
  CACHED_GREGORIAN: "prayer_cached_gregorian",
  CACHED_CITY: "prayer_cached_city",
  CALC_METHOD: "prayer_calc_method",
  MANUAL_LOCATION: "prayer_manual_location",
  HIJRI_ADJUSTMENT: "prayer_hijri_adjustment",
};

const formatTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const parseTime = (time24: string): Date => {
  const [hours, minutes] = time24.split(":").map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
};

const getTodayString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const usePrayerTimes = (): UsePrayerTimesResult => {
  const { lang } = useLanguage();
  const [prayers, setPrayers] = useState<PrayerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("جارٍ التحديد...");
  const [currentPrayerIndex, setCurrentPrayerIndex] = useState(0);
  const [nextPrayerTime, setNextPrayerTime] = useState<Date | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [gregorianDate, setGregorianDate] = useState<GregorianDate | null>(null);
  const [locationSaved, setLocationSaved] = useState(
    () => localStorage.getItem(STORAGE_KEYS.LOCATION_SAVED) === "true"
  );
  const [isManualLocation, setIsManualLocation] = useState(
    () => localStorage.getItem(STORAGE_KEYS.MANUAL_LOCATION) === "true"
  );
  const [calculationMethod, setCalculationMethodState] = useState(
    () => parseInt(localStorage.getItem(STORAGE_KEYS.CALC_METHOD) || "3")
  );
  const [hijriAdjustment, setHijriAdjustmentState] = useState(
    () => parseInt(localStorage.getItem(STORAGE_KEYS.HIJRI_ADJUSTMENT) || "0")
  );
  const [latitude, setLatitude] = useState<number | undefined>(() => {
    const lat = localStorage.getItem(STORAGE_KEYS.LATITUDE);
    return lat ? parseFloat(lat) : undefined;
  });
  const [longitude, setLongitude] = useState<number | undefined>(() => {
    const lng = localStorage.getItem(STORAGE_KEYS.LONGITUDE);
    return lng ? parseFloat(lng) : undefined;
  });

  const setCalculationMethod = useCallback((method: number) => {
    setCalculationMethodState(method);
    localStorage.setItem(STORAGE_KEYS.CALC_METHOD, String(method));
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE);
  }, []);

  const setHijriAdjustment = useCallback((adj: number) => {
    setHijriAdjustmentState(adj);
    localStorage.setItem(STORAGE_KEYS.HIJRI_ADJUSTMENT, String(adj));
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE);
  }, []);

  const processPrayerData = useCallback((data: any) => {
    const timings: PrayerTimesData = data.data.timings;

    const prayerKeys: { name: string; nameEn: keyof PrayerTimesData }[] = [
      { name: "الفجر", nameEn: "Fajr" },
      { name: "الشروق", nameEn: "Sunrise" },
      { name: "الظهر", nameEn: "Dhuhr" },
      { name: "العصر", nameEn: "Asr" },
      { name: "المغرب", nameEn: "Maghrib" },
      { name: "العشاء", nameEn: "Isha" },
    ];

    const mapped: PrayerInfo[] = prayerKeys.map((p) => {
      const raw = timings[p.nameEn].split(" ")[0];
      return {
        name: p.name,
        nameEn: p.nameEn,
        time: formatTo12Hour(raw),
        time24: raw,
        timestamp: parseTime(raw)
      };
    });

    setPrayers(mapped);
    localStorage.setItem(STORAGE_KEYS.CACHED_PRAYERS, JSON.stringify(mapped));

    // Hijri date
    const hijri = data.data.date?.hijri;
    if (hijri) {
      const hijriInfo: HijriDate = {
        date: hijri.date,
        day: hijri.day,
        month: hijri.month?.ar || hijri.month?.en || "",
        monthNumber: parseInt(hijri.month?.number || "1"),
        year: hijri.year,
        weekday: hijri.weekday?.ar || "",
      };
      setHijriDate(hijriInfo);
      localStorage.setItem(STORAGE_KEYS.CACHED_HIJRI, JSON.stringify(hijriInfo));
    }

    // Gregorian date
    const greg = data.data.date?.gregorian;
    if (greg) {
      const gregInfo: GregorianDate = { date: greg.date };
      setGregorianDate(gregInfo);
      localStorage.setItem(STORAGE_KEYS.CACHED_GREGORIAN, JSON.stringify(gregInfo));
    }

    // Current prayer index (Skipping Sunrise which is index 1)
    const now = new Date();
    const times24 = mapped.map((p) => p.time24);
    
    // We only care about: 0:Fajr, 2:Dhuhr, 3:Asr, 4:Maghrib, 5:Isha
    const obligatoryIndices = [0, 2, 3, 4, 5];
    
    let cpIndex = 5; // Default to Isha if before Fajr or after Isha
    for (let i = obligatoryIndices.length - 1; i >= 0; i--) {
      const actualIdx = obligatoryIndices[i];
      if (now >= parseTime(times24[actualIdx])) {
        cpIndex = actualIdx;
        break;
      }
    }
    
    // If it's before Fajr today, current prayer is technically Isha of yesterday
    if (now < parseTime(times24[0])) {
       cpIndex = 5;
    }

    setCurrentPrayerIndex(cpIndex);

    // Next Prayer Logic
    let nextIdx = 0;
    if (cpIndex === 5) {
      nextIdx = 0; // After Isha -> Next is Fajr
    } else {
      // Find the next obligatory index
      const currArrIndex = obligatoryIndices.indexOf(cpIndex);
      nextIdx = obligatoryIndices[currArrIndex + 1];
    }
    
    const nextTime = parseTime(times24[nextIdx]);
    // If next is Fajr and we are currently at/after Isha, it means tomorrow's Fajr
    if (cpIndex === 5 && now >= parseTime(times24[5])) {
      nextTime.setDate(nextTime.getDate() + 1);
    }
    setNextPrayerTime(nextTime);

    // City (only set from API if not manual)
    if (!localStorage.getItem(STORAGE_KEYS.MANUAL_LOCATION) || localStorage.getItem(STORAGE_KEYS.MANUAL_LOCATION) !== "true") {
      const meta = data.data.meta;
      const timezone = meta?.timezone || "";
      let cityName = "موقعك الحالي";
      
      if (timezone.includes("Riyadh")) cityName = lang === 'ar' ? "الرياض" : "Riyadh";
      else if (timezone.includes("Makkah") || timezone.includes("Mecca")) cityName = lang === 'ar' ? "مكة المكرمة" : "Makkah";
      else if (timezone.includes("Algiers")) cityName = lang === 'ar' ? "الجزائر" : "Algiers";
      else cityName = timezone.split("/").pop()?.replace(/_/g, " ") || (lang === 'ar' ? "موقعك الحالي" : "Current Location");

      setCity(cityName);
      localStorage.setItem(STORAGE_KEYS.CACHED_CITY, cityName);
    }

    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, getTodayString());
    setLoading(false);
  }, []);

  const fetchFromAPI = useCallback(async (lat: number, lng: number, adj?: number) => {
    try {
      const today = new Date();
      const dd = today.getDate();
      const mm = today.getMonth() + 1;
      const yyyy = today.getFullYear();
      const adjustment = adj ?? parseInt(localStorage.getItem(STORAGE_KEYS.HIJRI_ADJUSTMENT) || "0");

      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=${calculationMethod}&adjustment=${adjustment}`
      );
      const data = await res.json();
      processPrayerData(data);
    } catch {
      loadFromCache();
      if (!prayers.length) {
        setError("تعذر تحميل أوقات الصلاة. تحقق من اتصالك بالإنترنت.");
        setLoading(false);
      }
    }
  }, [calculationMethod, processPrayerData]);

  const loadFromCache = useCallback(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.CACHED_PRAYERS);
    const cachedHijri = localStorage.getItem(STORAGE_KEYS.CACHED_HIJRI);
    const cachedGreg = localStorage.getItem(STORAGE_KEYS.CACHED_GREGORIAN);
    const cachedCity = localStorage.getItem(STORAGE_KEYS.CACHED_CITY);

    if (cached) {
      const data = JSON.parse(cached) as PrayerInfo[];
      setPrayers(data);

      const now = new Date();
      const obligatoryIndices = [0, 2, 3, 4, 5];
      
      let cpIndex = 5;
      for (let i = obligatoryIndices.length - 1; i >= 0; i--) {
        const actualIdx = obligatoryIndices[i];
        if (now >= parseTime(data[actualIdx].time24)) {
          cpIndex = actualIdx;
          break;
        }
      }
      
      if (now < parseTime(data[0].time24)) {
         cpIndex = 5;
      }

      setCurrentPrayerIndex(cpIndex);

      let nextIdx = 0;
      if (cpIndex === 5) {
        nextIdx = 0;
      } else {
        const currArrIndex = obligatoryIndices.indexOf(cpIndex);
        nextIdx = obligatoryIndices[currArrIndex + 1];
      }
      
      const nextTime = parseTime(data[nextIdx].time24);
      if (cpIndex === 5 && now >= parseTime(data[5].time24)) {
        nextTime.setDate(nextTime.getDate() + 1);
      }
      setNextPrayerTime(nextTime);
      setLoading(false);
    }
    if (cachedHijri) setHijriDate(JSON.parse(cachedHijri));
    if (cachedGreg) setGregorianDate(JSON.parse(cachedGreg));
    if (cachedCity) setCity(cachedCity);
  }, []);

  const saveLocation = useCallback((lat: number, lng: number) => {
    localStorage.setItem(STORAGE_KEYS.LATITUDE, String(lat));
    localStorage.setItem(STORAGE_KEYS.LONGITUDE, String(lng));
    localStorage.setItem(STORAGE_KEYS.LOCATION_SAVED, "true");
    setLocationSaved(true);
    setLatitude(lat);
    setLongitude(lng);
  }, []);

  const getGPSLocation = async (highAccuracy: boolean = true) => {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 15000 : 10000, // Increased timeout
        maximumAge: highAccuracy ? 0 : 300000
      });
      return coordinates;
    } catch (e: any) {
      console.warn(`GPS fetch failed (${highAccuracy ? 'high' : 'low'} accuracy):`, e);
      if (highAccuracy) {
        // Fallback to low accuracy with even longer timeout
        return await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        });
      }
      throw e;
    }
  };

  // Auto-detect GPS location
  const refreshLocation = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEYS.MANUAL_LOCATION);
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE);
    setIsManualLocation(false);
    setLoading(true);
    setError(null);

    try {
      if (Capacitor.getPlatform() !== 'web') {
        const perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            throw new Error('PERMISSION_DENIED');
          }
        }
      }

      const coordinates = await getGPSLocation(true);
      const lat = coordinates.coords.latitude;
      const lng = coordinates.coords.longitude;
      
      saveLocation(lat, lng);
      fetchFromAPI(lat, lng);
    } catch (e: any) {
      console.error('GPS error:', e);
      
      // Try to use last known location if available
      const savedLat = localStorage.getItem(STORAGE_KEYS.LATITUDE);
      const savedLng = localStorage.getItem(STORAGE_KEYS.LONGITUDE);
      
      if (savedLat && savedLng) {
        fetchFromAPI(parseFloat(savedLat), parseFloat(savedLng));
        if (e.message === 'PERMISSION_DENIED') {
          setError(lang === 'ar' ? "تم رفض الوصول للموقع. تم استخدام آخر موقع معروف." : "Location access denied. Using last known location.");
        } else {
          setError(lang === 'ar' ? "تعذر تحديد الموقع بدقة. تم استخدام آخر موقع معروف." : "Could not determine location accurately. Using last known location.");
        }
      } else {
        // Ultimate fallback to Makkah
        const lat = 21.4225, lng = 39.8262;
        saveLocation(lat, lng);
        setCity("مكة المكرمة");
        localStorage.setItem(STORAGE_KEYS.CACHED_CITY, "مكة المكرمة");
        fetchFromAPI(lat, lng);
        setError(lang === 'ar' ? "تعذر تحديد الموقع. تم تعيين مكة المكرمة كافتراضي." : "Could not determine location. Defaulting to Makkah.");
      }
    }
  }, [fetchFromAPI, saveLocation, lang]);

  // Request location on first load or periodically
  // Manual city selection
  const setManualLocation = useCallback((lat: number, lng: number, cityName: string) => {
    saveLocation(lat, lng);
    localStorage.setItem(STORAGE_KEYS.MANUAL_LOCATION, "true");
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE);
    setIsManualLocation(true);
    setCity(cityName);
    localStorage.setItem(STORAGE_KEYS.CACHED_CITY, cityName);
    setLoading(true);
    fetchFromAPI(lat, lng);
  }, [fetchFromAPI, saveLocation]);

  const requestLocation = useCallback(async () => {
    try {
      if (Capacitor.getPlatform() !== 'web') {
        // Always request permissions (handles 'prompt' and 'denied' states)
        const req = await Geolocation.requestPermissions();
        if (req.location === 'granted') {
          try {
            const coordinates = await getGPSLocation(true);
            saveLocation(coordinates.coords.latitude, coordinates.coords.longitude);
            fetchFromAPI(coordinates.coords.latitude, coordinates.coords.longitude);
            return;
          } catch (gpsErr) {
            console.warn('GPS failed after permission granted:', gpsErr);
          }
        }
        // Permission denied or GPS failed - fallback to cache or Makkah
        const cached = localStorage.getItem(STORAGE_KEYS.CACHED_PRAYERS);
        if (cached) {
          loadFromCache();
        } else {
          // Ultimate fallback: Makkah
          const lat = 21.4225, lng = 39.8262;
          saveLocation(lat, lng);
          setCity(lang === 'ar' ? 'مكة المكرمة' : 'Makkah');
          localStorage.setItem(STORAGE_KEYS.CACHED_CITY, lang === 'ar' ? 'مكة المكرمة' : 'Makkah');
          fetchFromAPI(lat, lng);
          setError(lang === 'ar' ? 'تعذّر تحديد الموقع. تم تعيين مكة المكرمة كافتراضي.' : 'Location unavailable. Defaulting to Makkah.');
        }
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            saveLocation(pos.coords.latitude, pos.coords.longitude);
            fetchFromAPI(pos.coords.latitude, pos.coords.longitude);
          },
          () => {
            const cached = localStorage.getItem(STORAGE_KEYS.CACHED_PRAYERS);
            if (cached) {
              loadFromCache();
            } else {
              const lat = 21.4225, lng = 39.8262;
              saveLocation(lat, lng);
              setCity('مكة المكرمة');
              fetchFromAPI(lat, lng);
            }
          }
        );
      }
    } catch (e) {
      console.error('requestLocation error:', e);
      const cached = localStorage.getItem(STORAGE_KEYS.CACHED_PRAYERS);
      if (cached) {
        loadFromCache();
      } else {
        setLoading(false);
        setError(lang === 'ar' ? 'تعذّر تحديد الموقع.' : 'Could not determine location.');
      }
    }
  }, [fetchFromAPI, saveLocation, loadFromCache, lang]);

  useEffect(() => {
    const savedLat = localStorage.getItem(STORAGE_KEYS.LATITUDE);
    const savedLng = localStorage.getItem(STORAGE_KEYS.LONGITUDE);
    const lastUpdate = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
    const today = getTodayString();
    const isSaved = localStorage.getItem(STORAGE_KEYS.LOCATION_SAVED) === "true";
    const cachedCity = localStorage.getItem(STORAGE_KEYS.CACHED_CITY);

    if (cachedCity) setCity(cachedCity);

    if (isSaved && savedLat && savedLng) {
      const lat = parseFloat(savedLat);
      const lng = parseFloat(savedLng);

      if (lastUpdate === today) {
        loadFromCache();
        if (!localStorage.getItem(STORAGE_KEYS.CACHED_PRAYERS)) {
          fetchFromAPI(lat, lng);
        }
      } else {
        // Load cache immediately to avoid blank screen, then fetch fresh
        loadFromCache();
        fetchFromAPI(lat, lng);
      }
    } else {
      requestLocation();
    }

    // Safety timeout: if still loading after 20s, force show error/cache
    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          const cached = localStorage.getItem(STORAGE_KEYS.CACHED_PRAYERS);
          if (cached) {
            loadFromCache();
          } else {
            // Fallback to Makkah
            const lat = 21.4225, lng = 39.8262;
            saveLocation(lat, lng);
            setCity('مكة المكرمة');
            fetchFromAPI(lat, lng);
          }
        }
        return prev;
      });
    }, 20000);

    return () => clearTimeout(timeout);
  }, [calculationMethod, hijriAdjustment, loadFromCache, fetchFromAPI, requestLocation, saveLocation]);

  return {
    prayers,
    loading,
    error,
    city,
    currentPrayerIndex,
    nextPrayerTime,
    hijriDate,
    gregorianDate,
    calculationMethod,
    setCalculationMethod,
    refreshLocation,
    setManualLocation,
    locationSaved,
    isManualLocation,
    hijriAdjustment,
    setHijriAdjustment,
  };
};
