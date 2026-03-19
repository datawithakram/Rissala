import { useEffect, useRef, useState, useCallback } from "react";
import { NotificationService } from "@/services/NotificationService";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

// قائمة الأذانات المتاحة من API
const ADHAN_API_URL = "https://raw.githubusercontent.com/muyassar/Adhan-Player/main/audio/adhan/";

// قائمة الأذانات مع معلوماتها (محلياً)
const ADHAN_LIST = [
  { 
    id: "mishary_alafasy",
    name: "mishary_alafasy", 
    label: { ar: "الأذان 1 (مشاري العفاسي)", en: "Adhan 1 (Mishary)" },
    url: "/audio/adhan/a1.mp3",
    duration: 45
  },
  { 
    id: "makkah",
    name: "makkah", 
    label: { ar: "الأذان 2 (الحرم المكي)", en: "Adhan 2 (Makkah)" },
    url: "/audio/adhan/makkahazan.mp3",
    duration: 30
  },
  { 
    id: "madinah",
    name: "madinah", 
    label: { ar: "الأذان 3 (الحرم النبوي)", en: "Adhan 3 (Madinah)" },
    url: "/audio/adhan/azan2.mp3",
    duration: 35
  },
  { 
    id: "kuwait",
    name: "kuwait", 
    label: { ar: "الأذان 4 (الكويت)", en: "Adhan 4 (Kuwait)" },
    url: "/audio/adhan/azan3.mp3",
    duration: 40
  },
  { 
    id: "turkey",
    name: "turkey", 
    label: { ar: "الأذان 5 (تركيا)", en: "Adhan 5 (Turkey)" },
    url: "/audio/adhan/azan5.mp3",
    duration: 35
  }
];

interface UseAdhanNotificationProps {
  prayers: Array<{ name: string; time: string; timestamp: Date }>;
  notifications: Record<number, boolean>;
  preAdhanMinutes?: number;
  iqamaMinutes?: number;
}

export const useAdhanNotification = ({ prayers, notifications, preAdhanMinutes = 0, iqamaMinutes = 0 }: UseAdhanNotificationProps) => {
  const [selectedAdhan, setSelectedAdhanState] = useState<string>(() => {
    return localStorage.getItem("selectedAdhan") || "mishary_alafasy";
  });

  const setSelectedAdhan = useCallback((adhanName: string) => {
    setSelectedAdhanState(adhanName);
    localStorage.setItem("selectedAdhan", adhanName);
  }, []);
  const [adhanList] = useState(ADHAN_LIST);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Initialize audio and notification actions
  useEffect(() => {
    let actionListener: any = null;

    const setupListeners = async () => {
      if (Capacitor.getPlatform() !== 'web') {
        await NotificationService.initializeActions();
      }

      actionListener = await LocalNotifications.addListener('localNotificationActionPerformed', (action: any) => {
        console.log('Notification action performed:', action);
        
        // Stop adhan audio if notification is clicked or action performed
        stopAdhan();

        if (action.actionId === 'share') {
          const prayerName = action.notification.extra?.prayerName || 'الصلاة';
          const text = `حان الآن وقت صلاة ${prayerName}. أذكركم ونفسي بالصلاة في وقتها. #الرسالة`;
          
          if (Capacitor.isNativePlatform()) {
            console.log('Sharing adhan message:', text);
          } else {
            if (navigator.share) {
              navigator.share({ text }).catch(console.error);
            }
          }
        }
      });
    };

    setupListeners();

    audioRef.current = new Audio();
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
      setAudioError(null);
    });
    audioRef.current.addEventListener('error', (e) => {
      console.error("Audio error:", e);
      setIsPlaying(false);
      setAudioError("فشل في تشغيل الصوت");
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (actionListener) {
        actionListener.remove();
      }
    };
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  const playAdhan = useCallback(async (adhanName: string) => {
    if (!audioRef.current) return;
    
    const adhan = adhanList.find(a => a.name === adhanName);
    if (!adhan) return;

    try {
      // Stop any currently playing audio
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioError(null);
      
      // Since files are now local, we can just assign the src directly
      // Avoids the need for blob fetching and CORS workarounds
      audioRef.current.src = adhan.url;
      audioRef.current.load();
      
      // Play the audio
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
        setAudioError(null);
        console.log(`Playing adhan: ${adhan.label.ar}`);
      }
    } catch (error) {
      console.error("Error playing adhan:", error);
      setIsPlaying(false);
      setAudioError("تعذر تشغيل الأذان. قد يكون هناك مشكلة في الاتصال بالإنترنت.");
    }
  }, [adhanList]);

  const stopAdhan = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setAudioError(null);
    }
  }, []);

  const testAdhan = useCallback((adhanName: string) => {
    playAdhan(adhanName);
  }, [playAdhan]);

  // Schedule background notifications for all prayers
  useEffect(() => {
    if (Capacitor.getPlatform() === 'web' || !prayers.length) return;

    const scheduleAll = async () => {
      // First cancel existing adhan notifications if any
      // LocalNotifications.cancel(...) could be called here to clear old ones
      
      for (let i = 0; i < prayers.length; i++) {
        if (notifications[i]) {
          const prayer = prayers[i];
          const [hours, minutes] = prayer.time.split(':').map(Number);
          const scheduledDate = new Date();
          scheduledDate.setHours(hours, minutes, 0, 0);
          
          if (scheduledDate.getTime() < Date.now()) {
            scheduledDate.setDate(scheduledDate.getDate() + 1);
          }

          // 1. Schedule Pre-Adhan reminder if requested
          if (preAdhanMinutes > 0) {
            const preDate = new Date(scheduledDate.getTime() - preAdhanMinutes * 60000);
            if (preDate.getTime() > Date.now()) {
              await NotificationService.scheduleBasicNotification(
                3000 + i,
                `اقتراب صلاة ${prayer.name}`,
                `بقي ${preAdhanMinutes} دقائق على صلاة ${prayer.name}`,
                preDate
              );
            }
          }

          // 2. Schedule the main Adhan
          await NotificationService.scheduleAdhanNotification(
            2000 + i, // Unique ID per prayer
            prayer.name,
            selectedAdhan,
            scheduledDate
          );

          // 3. Schedule Iqama reminder if requested
          if (iqamaMinutes > 0) {
            const iqamaDate = new Date(scheduledDate.getTime() + iqamaMinutes * 60000);
            if (iqamaDate.getTime() > Date.now()) {
              await NotificationService.scheduleBasicNotification(
                4000 + i,
                `إقامة صلاة ${prayer.name}`,
                `حان الآن وقت إقامة صلاة ${prayer.name}`,
                iqamaDate
              );
            }
          }
        }
      }
    };

    scheduleAll();
  }, [prayers, notifications, selectedAdhan, preAdhanMinutes, iqamaMinutes]);

  // Check for prayer times (Foreground logic)
  useEffect(() => {
    if (!("Notification" in window) || !notifications || !prayers.length) return;

    const checkNotifications = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      prayers.forEach((prayer, index) => {
        if (notifications[index] && prayer.time === currentTime) {
          // Send notification
          if (Notification.permission === "granted") {
            new Notification(`🕌 ${prayer.name}`, {
              body: `حان وقت صلاة ${prayer.name}`,
              icon: "/icon-192.png",
              silent: true,
            });
          }

          // Play adhan
          playAdhan(selectedAdhan);
        }
      });
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    checkNotifications(); // Check immediately

    return () => clearInterval(interval);
  }, [prayers, notifications, selectedAdhan, playAdhan]);

  const getSelectedAdhanName = useCallback(() => selectedAdhan, [selectedAdhan]);

  return {
    requestNotificationPermission,
    testAdhan,
    stopAdhan,
    setSelectedAdhan,
    getSelectedAdhanName,
    adhanList,
    isPlaying,
    audioError,
  };
};