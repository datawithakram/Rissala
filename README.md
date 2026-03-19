# 🕌 الرسالة | Al Risala (Islamic Divine Compass)

A comprehensive, beautifully designed Islamic application built with React, TypeScript, Vite, and Capacitor. **Al Risala** provides Muslims with essential daily tools including accurate prayer times, Qibla direction, Zakat and Inheritance calculators, and persistent Adhan notifications. 

The application is fully cross-platform, optimized for **Web (PWA)**, **Android**, and **iOS**, featuring a fluid interface with dynamic theming and bilingual support (Arabic & English).

---

## ✨ Key Features

### 🌍 Progressive Web App (PWA) - NEW 🚀
- **Installable:** Install the app directly from your browser on desktop or mobile.
- **Offline Mode:** Fully functional even without an internet connection, with smart caching of prayer times and assets.
- **Auto-Update:** Notifies the user when a new version is available with a "Update Now" prompt.
- **Standalone Experience:** Runs in its own window without browser UI, providing a native-app feel.

### 🕋 Prayer Times & Adhan Notifications
- **High-Accuracy Prayer Times:** Calculated offline based on automatic GPS detection or manual city search.
- **Reliable Adhan Background Service:** Unified notification system for both Native (Capacitor) and Web Push.
- **Custom Muezzin Selection:** Choose from multiple beautifully recorded Adhans (Mishary Alafasy, Makkah, Madinah, etc.).
- **Pre-Prayer & Iqama Alerts:** Get notified specific minutes before the Adhan and when it is time for Iqama.

### 🧭 Precision Qibla Compass
- Smooth, jitter-free Qibla direction utilizing native device sensors (Capacitor) or high-precision web APIs.
- Beautiful graphical compass interface with visual feedback when aligned perfectly with the Kaaba.

### 📅 Advanced Hijri Calendar
- Integrated dual-calendar system (Gregorian/Hijri) with manual adjustment (+1/-1 days).

### 💰 Essential Calculators
- **Zakat Calculator:** Computation based on current Nisab values across wealth categories.
- **Inheritance (Mawarith) Calculator:** Algorithmically precise distribution according to Sharia law.

---

## 🛠️ Unified Architecture

The project features a **unified codebase** that adapts to the environment (Native vs Web):
- **Unified Storage:** A custom `StorageService` that abstracts `@capacitor/preferences` and `localStorage`.
- **Unified Notifications:** A single `NotificationService` API that intelligently handles Capacitor Local Notifications and Web Push APIs.
- **Environment Detection:** Smart logic to ensure Service Workers and native plugins don't conflict.

---

## 🚀 Getting Started

### Installation
1. `git clone https://github.com/datawithakram/Rissala.git`
2. `npm install`
3. `npm run dev`

### PWA Preview
- `npm run build`
- `npm run preview` (Test the PWA install prompt and offline support)

### Building for Mobile (Capacitor)
- `npm run build`
- `npx cap sync android` or `npx cap sync ios`
- `npx cap open android` or `npx cap open ios`

---

## 📱 Icons & Splash Screens
This project uses `@capacitor/assets` for native assets and `vite-plugin-pwa` for web manifest icons.
To regenerate:
1. Update `assets/icon.svg` & `assets/splash.svg`.
2. Run: `npx @capacitor/assets generate` followed by `npm run build`.

---

**Made with ❤️ for the Muslim Ummah.**
