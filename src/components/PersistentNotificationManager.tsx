import { useEffect, useRef } from "react";
import { NotificationService } from "@/services/NotificationService";
import { useLanguage } from "@/contexts/LanguageContext";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

interface PrayerTime {
  name: string;
  nameEn: string;
  time24: string;
  timestamp: Date;
}

const PRAYER_NAMES: Record<string, string> = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

// Read cached prayers from localStorage (set by usePrayerTimes on any page)
const getCachedPrayers = (): PrayerTime[] => {
  try {
    const raw = localStorage.getItem("prayer_cached_data");
    if (!raw) return [];
    const parsed: PrayerTime[] = JSON.parse(raw);
    // Reconstruct Date objects from time24
    return parsed.map((p) => {
      const [h, m] = (p.time24 || "00:00").split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return { ...p, timestamp: d };
    });
  } catch {
    return [];
  }
};

const getNextPrayer = (prayers: PrayerTime[]): { prayer: PrayerTime; nextTime: Date } | null => {
  if (!prayers.length) return null;
  const now = new Date();
  const obligatory = prayers.filter((p) => p.nameEn !== "Sunrise");

  for (const p of obligatory) {
    if (p.timestamp > now) {
      return { prayer: p, nextTime: p.timestamp };
    }
  }
  // After Isha → Fajr tomorrow
  const fajr = obligatory[0];
  if (fajr) {
    const tomorrow = new Date(fajr.timestamp);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { prayer: fajr, nextTime: tomorrow };
  }
  return null;
};

export const PersistentNotificationManager = () => {
  const { lang } = useLanguage();
  const lastSentRef = useRef<string>("");
  const startedRef = useRef(false);

  useEffect(() => {
    if (Capacitor.getPlatform() !== "web" && !startedRef.current) {
      startedRef.current = true;
      
      // Stop the persistent background service (it was temporary/requested to be removed)
      NotificationService.stopPersistentNotification();
      
      // Initialize adhan notification channels for Android
      NotificationService.createAdhanChannels().catch(console.error);

      // Request notification permission on Android 13+
      LocalNotifications.checkPermissions().then(async (perm) => {
        if (perm.display !== "granted") {
          await LocalNotifications.requestPermissions();
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const notifEnabled = localStorage.getItem("notifications_enabled");
    if (notifEnabled === "false") return;

    // Schedule prayer time notifications with adhan sound
    const scheduleAdhanNotifications = async () => {
      try {
        if (Capacitor.getPlatform() === "web") return;
        const prayers = getCachedPrayers();
        if (!prayers.length) return;

        const selectedAdhan = localStorage.getItem("selectedAdhan") || "mishary_alafasy";
        const notifications_map: Record<string, string> = {
          mishary_alafasy: "adhan_mishary",
          makkah: "adhan_makkah",
          madinah: "adhan_madinah",
          kuwait: "adhan_kuwait",
          turkey: "adhan_turkey",
        };
        const soundFile = notifications_map[selectedAdhan] || "adhan_mishary";

        const now = new Date();
        
        // Cancel existing adhan notifications (IDs 2000-2100)
        await LocalNotifications.cancel({
          notifications: Array.from({ length: 100 }, (_, i) => ({ id: 2000 + i })),
        }).catch(() => {});

        let notifId = 2001;
        const obligatory = prayers.filter((p) => p.nameEn !== "Sunrise");
        
        // Also load prayer notification settings
        const prayerNotifSettings: Record<number, boolean> = JSON.parse(
          localStorage.getItem("prayer_notifications") || "{}"
        );

        // Pre-adhan & iqama settings
        const preAdhanMinutes = parseInt(localStorage.getItem("pre_adhan_minutes") || "0");
        const iqamaMinutes = parseInt(localStorage.getItem("iqama_minutes") || "0");

        for (let i = 0; i < obligatory.length; i++) {
          const prayer = obligatory[i];
          
          // Check if notification enabled (default to true for all)
          const notifKey = i;
          const isEnabled = prayerNotifSettings[notifKey] !== false;
          if (!isEnabled) continue;

          let scheduledAt = new Date(prayer.timestamp);
          // If time already passed today, schedule for tomorrow
          if (scheduledAt <= now) {
            scheduledAt.setDate(scheduledAt.getDate() + 1);
          }

          // Main adhan notification (with sound)
          // For Android, sound MUST be tied to a channel if targeting API 26+
          await LocalNotifications.schedule({
            notifications: [
              {
                title: `🕌 ${lang === "ar" ? prayer.name : prayer.nameEn}`,
                body: lang === "ar"
                  ? `حان وقت صلاة ${prayer.name} - الله أكبر`
                  : `Time for ${prayer.nameEn} prayer`,
                id: 2000, // Fixed ID to ensure newer prayer replaces older one
                schedule: { at: scheduledAt },
                sound: `${soundFile}.mp3`,
                channelId: soundFile,
                actionTypeId: "ADHAN_ACTIONS",
                extra: { prayerName: prayer.name, adhanId: selectedAdhan },
              },
            ],
          });

          // Pre-adhan reminder
          if (preAdhanMinutes > 0) {
            const preAdhanAt = new Date(scheduledAt.getTime() - preAdhanMinutes * 60 * 1000);
            if (preAdhanAt > now) {
              await LocalNotifications.schedule({
                notifications: [
                  {
                    title: lang === "ar" ? `⏰ تنبيه قبل الأذان` : `⏰ Pre-Adhan Alert`,
                    body: lang === "ar"
                      ? `${prayer.name} بعد ${preAdhanMinutes} دقيقة`
                      : `${prayer.nameEn} in ${preAdhanMinutes} minutes`,
                    id: notifId++,
                    schedule: { at: preAdhanAt },
                    extra: { type: "pre_adhan", prayerName: prayer.name },
                  },
                ],
              });
            }
          }

          // Iqama reminder
          if (iqamaMinutes > 0) {
            const iqamaAt = new Date(scheduledAt.getTime() + iqamaMinutes * 60 * 1000);
            await LocalNotifications.schedule({
              notifications: [
                {
                  title: lang === "ar" ? `🕌 وقت الإقامة` : `🕌 Iqama Time`,
                  body: lang === "ar"
                    ? `إقامة صلاة ${prayer.name}`
                    : `Iqama for ${prayer.nameEn}`,
                  id: notifId++,
                  schedule: { at: iqamaAt },
                  extra: { type: "iqama", prayerName: prayer.name },
                },
              ],
            });
          }
        }

        // Store when we last scheduled
        localStorage.setItem("last_scheduled_date", new Date().toDateString());
      } catch (e) {
        console.error("Failed to schedule adhan notifications:", e);
      }
    };

    // Reschedule adhan notifications if day changed or first run or storage changed
    const lastScheduled = localStorage.getItem("last_scheduled_date");
    if (lastScheduled !== new Date().toDateString() || lastSentRef.current === "RESCHEDULE") {
      lastSentRef.current = "";
      scheduleAdhanNotifications();
    }

  }, [lang]);

  // Listen for changes in prayer cache (after visiting prayer page)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "prayer_cached_data") {
        lastSentRef.current = "RESCHEDULE";
        // Force a re-render by updating a dummy state if needed, 
        // but since this is a manager, we can just wait for next tick or lang change.
        // Actually, let's just use a simple state to force re-render.
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return null;
};
