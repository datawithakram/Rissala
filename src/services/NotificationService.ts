import { Capacitor, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface PersistentNotificationPlugin {
  start(options: { title: string; body: string; timeRemaining?: string }): Promise<void>;
  update(options: { title?: string; body?: string; timeRemaining?: string }): Promise<void>;
  stop(): Promise<void>;
}

const PersistentNotification = registerPlugin<PersistentNotificationPlugin>('PersistentNotification');

const ADHAN_SOUND_MAP: Record<string, string> = {
  "mishary_alafasy": "adhan_mishary",
  "makkah": "adhan_makkah",
  "madinah": "adhan_madinah",
  "kuwait": "adhan_kuwait",
  "turkey": "adhan_turkey",
  "qari_wadi": "adhan_wadi",
  "abdul_basit": "adhan_abdul_basit",
  "hussein_mousa": "adhan_hussein",
  "ibrahim_alshaibani": "adhan_ibrahim",
  "mohammed_albaijan": "adhan_mohammed",
  "mustafa_ismail": "adhan_mustafa",
  "nasser_alqatami": "adhan_nasser",
  "yasser_aldosari": "adhan_yasser",
};

export class NotificationService {
  static async initializeActions() {
    if (Capacitor.getPlatform() === 'web') return;

    try {
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: 'ADHAN_ACTIONS',
            actions: [
              {
                id: 'share',
                title: 'مشاركة الأذان (Share)',
              },
              {
                id: 'dismiss',
                title: 'إغلاق (Close)',
                destructive: true,
              },
            ],
          },
        ],
      });
    } catch (e) {
      console.error('Failed to register notification action types', e);
    }
  }

  static async scheduleAdhanNotification(id: number, prayerName: string, adhanId: string, scheduledDate: Date) {
    const soundFile = ADHAN_SOUND_MAP[adhanId] || 'adhan_mishary';
    
    try {
      const { display } = await LocalNotifications.checkPermissions();
      if (display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: `🕌 وقت صلاة ${prayerName}`,
            body: `حان الآن وقت صلاة ${prayerName}`,
            id: id,
            schedule: { at: scheduledDate },
            sound: Capacitor.getPlatform() === 'android' ? `${soundFile}.mp3` : undefined,
            channelId: Capacitor.getPlatform() === 'android' ? adhanId : undefined,
            actionTypeId: 'ADHAN_ACTIONS',
            autoCancel: false, // Keep it in notification center until clicked
            ongoing: true, // For android, keeps the notification active to ensure sound plays (often used with foreground services, but helps here)
            extra: {
              prayerName,
              adhanId
            }
          },
        ],
      });
    } catch (e) {
      console.error('Failed to schedule Adhan notification', e);
    }
  }

  static async scheduleBasicNotification(id: number, title: string, body: string, scheduledDate: Date) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: id,
            schedule: { at: scheduledDate },
            // Uses default system sound
            autoCancel: true,
          },
        ],
      });
    } catch (e) {
      console.error('Failed to schedule basic notification', e);
    }
  }

  static async startPersistentNotification(prayerName?: string, label?: string, timeRemaining?: string) {
    const defaultPrayerName = prayerName || 'الرسالة';
    const defaultLabel = label || 'الصلاة القادمة';
    const defaultTime = timeRemaining || '--';

    if (Capacitor.getPlatform() === 'android') {
      try {
        await PersistentNotification.start({
          title: defaultPrayerName,
          body: defaultLabel,
          timeRemaining: defaultTime
        });
      } catch (e) {
        console.error('Failed to start Android persistent notification', e);
      }
    }

    if (Capacitor.getPlatform() === 'ios') {
      try {
        const { display } = await LocalNotifications.checkPermissions();
        if (display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }

        await LocalNotifications.schedule({
          notifications: [
            {
              title: `🕌 ${defaultLabel}: ${defaultPrayerName}`,
              body: defaultTime,
              id: 1,
              schedule: { at: new Date(Date.now() + 1000) },
              ongoing: true,
            },
          ],
        });
      } catch (e) {
        console.error('Failed to schedule iOS notification', e);
      }
    }
  }

  static async updateNotification(prayerName?: string, label?: string, timeRemaining?: string) {
    if (Capacitor.getPlatform() === 'android') {
      try {
        await PersistentNotification.update({ title: prayerName, body: label, timeRemaining });
      } catch (e) {
        console.error('Failed to update Android notification', e);
      }
    }
    if (Capacitor.getPlatform() === 'ios') {
      await this.startPersistentNotification(prayerName, label, timeRemaining);
    }
  }

  static async stopPersistentNotification() {
    if (Capacitor.getPlatform() === 'android') {
      try {
        await PersistentNotification.stop();
      } catch (e) {
        console.error('Failed to stop Android service', e);
      }
    }
    if (Capacitor.getPlatform() === 'ios') {
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
    }
  }

  static async requestPermission(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      const { display } = await LocalNotifications.checkPermissions();
      if (display !== 'granted') {
        const { display: newStatus } = await LocalNotifications.requestPermissions();
        return newStatus === 'granted';
      }
      return true;
    } else {
      if (!('Notification' in window)) return false;
      if (Notification.permission === 'granted') return true;
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  }

  /**
   * Unified notification sender
   */
  static async sendNotification(title: string, body: string, options: { id?: number; data?: any } = {}) {
    if (Capacitor.isNativePlatform()) {
      // For native, use LocalNotifications for immediate alerts
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: options.id || Math.floor(Math.random() * 10000),
            extra: options.data,
            schedule: { at: new Date() },
          },
        ],
      });
    } else {
      // For web, use the native Notification API or Service Worker
      if (Notification.permission === 'granted') {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.showNotification(title, {
            body,
            data: options.data,
            icon: '/icons/icon-192.webp',
            dir: 'rtl',
            lang: 'ar'
          });
        } else {
          new Notification(title, { body, data: options.data });
        }
      } else {
        console.warn('Notification permission not granted');
      }
    }
  }

  static async createAdhanChannels() {
    if (Capacitor.getPlatform() !== 'android') return;

    const adhanInfo = [
      { id: 'adhan_mishary', name: 'الأذان (مشاري العفاسي)', sound: 'adhan_mishary' },
      { id: 'adhan_makkah', name: 'الأذان (الحرم المكي)', sound: 'adhan_makkah' },
      { id: 'adhan_madinah', name: 'الأذان (الحرم النبوي)', sound: 'adhan_madinah' },
      { id: 'adhan_kuwait', name: 'الأذان (الكويت)', sound: 'adhan_kuwait' },
      { id: 'adhan_turkey', name: 'الأذان (تركيا)', sound: 'adhan_turkey' }
    ];

    for (const adhan of adhanInfo) {
      try {
        await LocalNotifications.createChannel({
          id: adhan.id,
          name: adhan.name,
          importance: 5,
          description: `صوت ${adhan.name}`,
          sound: `${adhan.sound}.mp3`,
          visibility: 1,
          vibration: true,
        });
      } catch (e) {
        console.error(`Error creating channel ${adhan.id}:`, e);
      }
    }
  }
}
