<p align="center">
  <img src="./assets/spin4pi-logo.png" alt="Spin4Pi Logo" width="200"/>
</p>

# 🌟 Spin4Pi - Ultimate Pi Gaming Experience

![Badge: Pi Network](https://img.shields.io/badge/Pi%20Network-Integration-success?style=for-the-badge) 
![Badge: Realtime Backend](https://img.shields.io/badge/Supabase-Realtime-blue?style=for-the-badge)
![Badge: Pi Payment](https://img.shields.io/badge/Pi%20Payment-Full%20Integration-brightgreen?style=for-the-badge)
![Badge: Web Audio](https://img.shields.io/badge/Web%20Audio-Sound%20FX-orange?style=for-the-badge)

**Spin4Pi** is an innovative gaming application delivering a fun **spin experience** with real rewards in **Pi currency**, fully integrated with **Pi SDK, Pi API, and Supabase** to ensure a seamless, secure, and realistic user experience.

---

## 🎯 Vision

Spin4Pi is a **recreational and educational platform** on the Pi Network where players can:

- Enjoy **daily Free and Paid Spins** with real Pi rewards.
- Build a **fully integrated digital economy** inside the game.
- Experience every Pi Network feature safely and realistically.

---

## 🕹️ Key Features

### 1️⃣ Advanced Spin System
- ✅ Daily Free Spin with **Supabase DB synchronized cooldown**.  
- ✅ Paid Spin with **real Pi payment** through Pi SDK.  
- ✅ Smart spin outcomes based on **player behavior and AI**.  
- ✅ Realistic sound effects using **Web Audio API**:  
  - Spin whoosh  
  - Segment tick  
  - Win / Jackpot / Lose  
  - Achievement unlock  

### 2️⃣ Integrated Pi Wallet
- 💰 **Real Pi balance linked to user account**.  
- 🔄 Automatic updates after each spin.  
- 🎁 Referral system for extra Pi rewards.  
- 🏆 Real-time leaderboard powered by **Supabase and Pi SDK**.  

### 3️⃣ Pi SDK & Pi API Integration
- 🔐 Secure login via **Pi SDK**.  
- 💳 Real Pi payments with **transaction verification**.  
- 📤 Share achievements and tournament wins directly on Pi Network.  
- 🌐 Full support for **Pi Browser** for all features.

### 4️⃣ Achievements & Social
- 🏅 Realistic achievement system unlocking new features.  
- 📱 Direct social sharing through Pi Network.  
- 🤝 Boost community interaction and engagement.

### 5️⃣ Supabase Backend
- 🔒 Secure storage for Profiles, Wallet, Spin History.  
- ⚡ Supabase Functions: `spin-result`, `complete-payment`, `approve-payment`.  
- 📊 Real-time leaderboard updates.  
- 📈 Analytics to track **player engagement and digital economy**.

### 6️⃣ User-Friendly Interface
- 🎨 Responsive design for all devices.  
- 🌙 Dark/Light mode support & accessibility.  
- ✨ Smooth animations for spins and rewards.

---

## 💎 Community Impact
- 📚 **Education and training in digital economy** using Pi.  
- 💵 **Real earning opportunities** with Pi tokens.  
- 🌍 Boosting Pi Network adoption in real-life use cases.  
- 🤗 Encouraging collaboration and healthy competition.  
- 🛠️ Supporting developers to create Pi-integrated content.

---

## 🔧 Technical Architecture

App.tsx ├── SoundSettingsProvider ├── QueryClientProvider ├── TooltipProvider ├── Toaster + Sonner (notifications) └── BrowserRouter ├── Index (Spin Page) │     ├── useSpinUnified │     ├── useWalletUnified │     ├── useSoundEffects │     └── usePiShare ├── Profile │     ├── useWalletUnified │     └── usePiAuthUnified ├── Marketplace ├── Achievements └── WithdrawalHistory

### 🔑 Main Hooks
- **useSpinUnified.ts** → Manage Free & Paid Spins with real Pi payments.  
- **useWalletUnified.ts** → Wallet management, Leaderboard, and digital economy analytics.  
- **usePiShare.ts** → Share achievements and tournament wins via Pi SDK.  
- **useSoundEffects.ts** → Realistic sound effects for Spin, Win, Lose, and Jackpot.  
- **usePiAuthUnified.ts** → Secure Pi SDK login and Supabase profile management.

---

## 📈 Analytics & Digital Economy
- Track rewards and player engagement in real-time.  
- Simulate Pi economy: balances, leaderboard, referrals, earnings.  
- Prevent cheating or manipulation.  
- Support Pi currency in all in-game transactions safely.

---

## 🚀 Why Spin4Pi is Unique
- 🛠️ **Full real integration with Pi SDK, Pi API, and Supabase**.  
- 🎮 Fun gameplay with real Pi rewards.  
- 📚 Educational and recreational for the Pi community.  
- ✨ Visually attractive and smooth interface.  
- 🔊 Advanced sound effects and animations for immersive experience.

---

## 🔒 Security & Privacy
- 🔐 Data encrypted and safely stored on Supabase.  
- 💳 Real Pi transactions secured via Pi SDK.  
- ⏱️ Safe Free and Paid Spin verification.

---

## 🏆 Call for Developers & Community
- 🌱 Contribute to **expanding Spin4Pi** through Open API or Tournament System.  
- 🏛️ Build a **community-driven system** that encourages interaction and rewards.  
- 🔗 Promote **Pi Network adoption** and increase real usage of Pi currency.

---

## 📌 Screenshots / Demo

<p align="center">
  <img src="./assets/spin-demo.gif" alt="Spin Demo" width="600"/>
</p>
<p align="center">
  <img src="./assets/leaderboard-demo.png" alt="Leaderboard Demo" width="600"/>
</p>

---

## 💡 Key Notes
- Everything is **real and fully integrated**, no mocks.  
- All financial operations are linked to **Pi SDK & Pi API**.  
- Supabase serves as a **secure and efficient backend** for all game data.

---

## 🔗 Useful Links
- Pi Network: [https://minepi.com](https://minepi.com)  
- Supabase: [https://supabase.com](https://supabase.com)  
- Spin4Pi GitHub: `https://github.com/your-repo/Spin4Pi`

---

<p align="center">
  <img src="./assets/spin4pi-logo.png" alt="Spin4Pi Logo" width="200"/>
</p>
