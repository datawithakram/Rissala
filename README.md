# 🕌 الرسالة | Al Risala (Islamic Divine Compass)

A comprehensive, beautifully designed Islamic application built with React, TypeScript, Vite, and Capacitor. **Al Risala** provides Muslims with essential daily tools including accurate prayer times, Qibla direction, Zakat and Inheritance calculators, and persistent Adhan notifications. 

The application is fully cross-platform, optimized for Web (PWA), Android, and iOS, featuring a fluid interface with dynamic theming and bilingual support (Arabic & English).

---

## ✨ Key Features

### 🕋 Prayer Times & Adhan Notifications
- **High-Accuracy Prayer Times:** Calculated offline based on automatic GPS detection or manual city search.
- **Multiple Calculation Methods:** Supports major global calculation conventions (Umm Al-Qura, ISNA, MWL, Egyptian General Authority, etc.).
- **Reliable Adhan Background Service:** Unique notification scheduling ensures you never miss a prayer, even when the app is completely closed.
- **Custom Muezzin Selection:** Choose from multiple beautifully recorded Adhans (Mishary Alafasy, Makkah, Madinah, etc.).
- **Pre-Prayer & Iqama Alerts:** Get notified specific minutes before the Adhan and when it is time for Iqama.
- **Android Battery Optimization Bypass:** Built-in native bridging to ensure background services keep running seamlessly.

### 🧭 Precision Qibla Compass
- Smooth, jitter-free Qibla direction utilizing native device magnetometer and gyroscope sensors via Capacitor.
- Beautiful graphical compass interface with visual haptic feedback when aligned perfectly with the Kaaba.

### 📅 Advanced Hijri Calendar
- Integrated dual-calendar system (Gregorian/Hijri).
- Manual Hijri day adjustment (+1/-1 days) to match local moon sightings.

### 💰 Essential Calculators
- **Zakat Calculator:** A dedicated tool for accurate Zakat computation based on current Nisab values across different wealth categories.
- **Inheritance (Mawarith) Calculator:** A highly advanced, algorithmically precise Islamic inheritance distribution calculator according to Sharia law.

### 🎨 UI/UX Excellence
- **Stunning Aesthetics:** Deep emerald and gold accents, beautiful typography, micro-animations, and seamless screen transitions.
- **Bilingual Interface:** Instantly switch between Arabic (RTL) and English (LTR) language modes.
- **Cross-Platform:** Beautifully packaged as an iOS app, Android APK, and installable Progressive Web App (PWA) with native splash screens.

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Shadcn UI, Framer Motion
- **Mobile Packaging:** Capacitor (Android & iOS)
- **State & Data Handling:** React Query, React Router, Context API
- **Localization:** i18next
- **APIs & Calculation:** Adhan.js, OpenStreetMap Nominatim 

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm package manager
- Android Studio (for Android deployment)
- Xcode (for iOS deployment, macOS required)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd divine-compass
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

### Building for Mobile (Capacitor)

1. **Build the React web bundle:**
   ```bash
   npm run build
   ```

2. **Sync the code to native platforms:**
   ```bash
   npx cap sync android
   npx cap sync ios
   ```

3. **Open the native IDE to compile and deploy:**
   - **Android:** `npx cap open android` (Opens Android Studio)
   - **iOS:** `npx cap open ios` (Opens Xcode)

---

## 📱 Generating App Icons & Splash Screens

This project uses `@capacitor/assets` to automatically generate icons and splash screens.
If you need to update the logo:
1. Replace `assets/logo.png` and `assets/splash.png` with your new high-res images.
2. Run the generator:
   ```bash
   npx @capacitor/assets generate
   npm run build
   npx cap sync
   ```

---

## 🔒 Permissions Required (Mobile)
- **Location:** For calculating accurate prayer timings and Qibla.
- **Notifications:** For scheduling the Adhan and alert reminders.
- **Ignore Battery Optimizations (Android):** Ensures alarms and background Adhan triggers reliably without OS interference. 

---

**Made with ❤️ for the Muslim Ummah.**
