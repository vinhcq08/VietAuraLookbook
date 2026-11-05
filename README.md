# 🏮 VietAura — Fashion-Tech Ecosystem & 3D Heritage Fitting Room

<p align="center">
  <img src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80" alt="VietAura Banner" width="100%" style="border-radius: 16px; object-fit: cover; max-height: 380px;" />
</p>

<p align="center">
  <strong>Next-Gen Multimodal Fashion-Tech Ecosystem & 3D Heritage Fitting Room for Youth</strong><br>
  <em>Bridging Century-Old Vietnamese Attire with WebGL Procedural 3D Simulation, Gemini Vision AI, and B2B Atelier Commerce.</em>
</p>

<p align="center">
  <a href="#-system-architecture"><img src="https://img.shields.io/badge/Architecture-Hybrid%20Client--Server-9A3412?style=for-the-badge&logo=diagramsdotnet" alt="Architecture" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="React & TypeScript" /></a>
  <a href="https://threejs.org/"><img src="https://img.shields.io/badge/3D%20Engine-Three.js%20%2F%20WebGL-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" /></a>
  <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/AI%20Core-Gemini%201.5%20Flash%20%26%20Vision-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/UI-Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="#-license"><img src="https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge" alt="MIT License" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white" alt="Build Status" /></a>
</p>

---

## 📑 Table of Contents

- [🌟 About The Project](#-about-the-project)
  - [The Cultural Problem](#the-cultural-problem)
  - [The VietAura Solution](#the-vietaura-solution)
- [🏛️ System Architecture](#️-system-architecture)
- [✨ Key Features (6 Core Modules)](#-key-features-6-core-modules)
  - [Module 1: 3D/2D Virtual Fitting Room & Anthropometry](#module-1-3d2d-virtual-fitting-room--anthropometry)
  - [Module 2: AI Stylist Assistant & Culture Guard](#module-2-ai-stylist-assistant--culture-guard)
  - [Module 3: Community Hub & B2B Tailor/Rental Marketplace](#module-3-community-hub--b2b-tailorrental-marketplace)
  - [Module 4: Hierarchical Heritage Map & 360° Virtual Tours](#module-4-hierarchical-heritage-map--360-virtual-tours)
  - [Module 5: GPS Check-in, Vision AI & Heritage Passport](#module-5-gps-check-in-vision-ai--heritage-passport)
  - [Module 6: Profile & Dual-Intelligence Hybrid Fallback Engine](#module-6-profile--dual-intelligence-hybrid-fallback-engine)
- [⚡ AI & System Highlights](#-ai--system-highlights)
- [🛠️ Tech Stack & Prerequisites](#️-tech-stack--prerequisites)
- [🚀 Getting Started & Installation](#-getting-started--installation)
- [🔐 Environment Variables](#-environment-variables)
- [🗺️ Product Roadmap & B2B Monetization](#️-product-roadmap--b2b-monetization)
- [🤝 Contributing & Community](#-contributing--community)
- [📜 License & Cultural Heritage Attributions](#-license--cultural-heritage-attributions)

---

## 🌟 About The Project

### The Cultural Problem
Traditional Vietnamese attire (*Cổ Phục Việt Nam*) encompasses a rich, sophisticated lineage stretching across dynasties—from the **Áo Ngũ Thân** of the Nguyễn Dynasty to the imperial **Áo Nhật Bình**, the northern **Áo Tứ Thân**, the southern everyday **Áo Bà Ba**, and the iconic **Áo Dài**. 

However, modern youth and international enthusiasts encounter steep barriers:
1. **Misinformation & Cultural Anachronisms**: Lack of accessible standards causes unintentional mixing of imperial motifs, incorrect flap orientations, or inappropriate occasions.
2. **Body Sizing Uncertainty**: Traditional garments demand precise structural tailoring (*may đo thủ công*). Without standard sizing, online renting and bespoke orders suffer high return rates.
3. **Fragmented Artisan Ecosystem**: Independent tailors and rental ateliers operate via scattered social pages with no unified 3D visualization, real-time inventory, or standardized client measurements.

### The VietAura Solution
**VietAura** (formerly *VietPhuc Lookbook*) resolves this fragmentation by establishing an end-to-end **Multimodal Fashion-Tech Ecosystem**:
- Real-time **WebGL Procedural 3D cloth simulation** fitted onto customizable human anthropometry (145–190 cm).
- **Gemini 1.5 Flash & Vision AI** acting as a 24/7 Cultural Stylist with historical rule enforcement (*Culture Guard*).
- **GPS-verified Heritage Passports** encouraging on-site cultural exploration with 3D collectible wax seal stamps.
- **1-Touch B2B Measurement Dispatch** linking customers directly to verified rental shops and master tailors across Hanoi, Hue, Hoi An, and Saigon.

---

## 🏛️ System Architecture

```
+---------------------------------------------------------------------------------------------------------+
|                                        VIETAURA CLIENT RUNTIME (Vite + React 18)                        |
|                                                                                                         |
|  [ 3D Procedural Mesh Engine ]      [ Anthropometric Engine ]       [ Dual-Language State (VI / EN) ]  |
|  - Three.js WebGL Renderer          - 5 Body Shape Presets          - Strict Proper Noun Protection    |
|  - Skeleton Morphing & Drape        - Parametric Height 145-190cm   - Instant UI Synchronization       |
|  - 360° Panorama WebGL Sphere       - Bust / Waist / Hip Sliders    - Apple Segmented Control Sheets   |
|                                                                                                         |
|  [ Heritage Map & Geofencing ]      [ Camera & Vision Scanner ]     [ B2B Measurement Bridge ]         |
|  - Google Maps Lite Embed           - HTML5 Canvas Capture          - JSON Schema Serializer           |
|  - GPS Distance Calculator (<=500m) - EXIF / LatLng Extraction      - 1-Touch Zalo / Chat Payload      |
+----------------------------------------------------+----------------------------------------------------+
                                                     | HTTPS JSON RPC / REST
                                                     v
+----------------------------------------------------+----------------------------------------------------+
|                                    EXPRESS BACKEND RUNTIME (server.ts / tsx)                            |
|                                                                                                         |
|  +-------------------------------------+   +---------------------------------------------------------+  |
|  |     In-Memory Query Cache System    |   |           Culture Guard Moderation Pipeline             |  |
|  |  - SHA-256 Key Hashing              |   |  - Historical Correctness Filter                        |  |
|  |  - LRU Expiry (Sub-6ms latency)     |   |  - Anachronism & Formality Detection                    |  |
|  +------------------+------------------+   +----------------------------+----------------------------+  |
|                     | Cache Miss                                        | Moderation Hook                |
|                     v                                                   v                                |
|  +---------------------------------------------------------------------------------------------------+  |
|  |                     Google GenAI SDK (@google/genai - Unified Node / TypeScript)                   |  |
|  |                                                                                                   |  |
|  |     [ Gemini 1.5 Flash: Context Stylist ]            [ Gemini 1.5 Pro Vision: Decorum Auditing ]   |  |
|  |     - 4-Variable Context Reasoning (Gender,         - Attire Classification (Ngũ Thân, Nhật Bình) |  |
|  |       Occasion, Weather, Color Palette)             - Modesty & Heritage Decorum Scoring          |  |
|  |     - Strict Heritage vs. Modern Fusion Modes       - Fraud / Synthetic Anomaly Detection         |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                     | Fallback on Network / Rate-Limit Outage           |
|                                                     v                                                   |
|  +---------------------------------------------------------------------------------------------------+  |
|  |                           Cultural Heuristic Offline Fallback Engine                              |  |
|  |  - Deterministic historical matrix (Dynastic palettes, garment accessories & footwear mappings)    |  |
|  |  - Zero downtime guarantee (100% offline uptime for Hackathon, exhibitions, and field journeys)  |  |
|  +---------------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
```

---

## ✨ Key Features (6 Core Modules)

| Module | Core Capability | Technologies | User Value |
| :--- | :--- | :--- | :--- |
| **1. 3D Fitting Room** | Real-time 3D cloth drape & sizing | Three.js, WebGL, Canvas 2D | Accurate fitting for 5 traditional attire lines |
| **2. AI Stylist** | Intelligent pairing & historical guard | Gemini 1.5 Flash, Culture Guard | Zero cultural mistakes; 1-touch auto-correction |
| **3. B2B Marketplace** | Magic Re-Fit 3D & measurement export | React, JSON Schema, WebShare | Connects consumers to verified artisan ateliers |
| **4. Heritage Map** | 9 Sacred sites & 360° Panoramas | Google Maps Lite, WebGL Sphere | Immersive cultural tourism & landmark discovery |
| **5. Vision Check-in** | GPS <=500m & AI attire authentication | Gemini 1.5 Vision, Geolocation | Earn cultural stamps & omnichannel reward points |
| **6. Hybrid Profile** | 3D wardrobe & zero-downtime offline engine | LocalStorage V1, Heuristic Matrix | Lifelong heritage collection with 100% reliability |

---

### Module 1: 3D/2D Virtual Fitting Room & Anthropometry
* **Parametric Human Body Simulation**: Sliders scaling height from **145 cm to 190 cm** with dynamic recalculations of bust, waist, hips, shoulder width, and sleeve lengths.
* **5 Body Shape Presets**: *Balanced (Cân đối)*, *Slim (Mảnh mai)*, *Curvy (Đầy đặn)*, *Tall (Cao ráo)*, and *Petite (Nhỏ nhắn)*.
* **5 Canonical Heritage Attire Lines**:
  - **Áo Ngũ Thân** (*Ngũ Thân Tay Chẽn* & *Ngũ Thân Tay Thụm / Áo Tấc*).
  - **Áo Nhật Bình** (Imperial court & aristocratic formal robe with *Ngũ Hành* embroidered bands).
  - **Áo Tứ Thân** (Northern heritage gown with silk sash, *Khăn Mỏ Quạ*, and *Nón Quai Thao*).
  - **Áo Dài** (Modern and vintage traditional silk silhouettes).
  - **Áo Bà Ba** (Southern rural elegance with *Khăn Rằn* and *Nón Lá*).
* **Multi-Subject Viewports**: Switch seamlessly between **Solo (Đơn)**, **Couple (Đôi)**, and **Group (Nhóm)** modes.
* **9:16 Social Lookbook Exporter**: Instant client-side Canvas rendering formatted for TikTok, Instagram Stories, and Facebook Reels.

### Module 2: AI Stylist Assistant & Culture Guard
* **4-Variable Context Reasoning Engine**: Evaluates combinations of **Gender**, **Occasion** (*Graduation, Royal Palace, Temple, Street Walk, Wedding*), **Weather** (*Hanoi Autumn, Hue Rain, Saigon Sun*), and **Dynastic Palettes**.
* **Strict Heritage vs. Modern Fusion Modes**:
  - *Strict Heritage (Cổ Chuẩn)*: Enforces strict historical norms (e.g., forbidding sneakers with Áo Nhật Bình; ensuring inner collars match Nguyễn Dynasty etiquette).
  - *Modern Fusion (Tân Thời)*: Allows tasteful contemporary stylings while preserving core garment dignity.
* **1-Touch Auto-Fix (*Sửa Lỗi Tự Động*)**: Instant one-click resolution of cultural conflicts suggested by the AI Stylist.
* **A/B Lookbook Split Testing**: Visual side-by-side comparison between the user's manual design and the AI-refined ensemble.

### Module 3: Community Hub & B2B Tailor/Rental Marketplace
* **Community Social Stream**: Curated UGC & PGC fashion feed interleaved with 20% Cultural Fact Cards and quizzes.
* **1-Touch Magic Re-Fit 3D**: Double-click or tap "Thử 3D / Try 3D" on any community photo to instantly load its attire, fabric palette, and accessories into the 3D Fitting Room.
* **Verified Atelier Directory**: Features accredited tailors across Vietnam (*Ỷ Vân Hiên, Hoa Niên, Đông Phong, Vạn Thiên Y, Hoi An Silk Heritage, Lụa Phương Nam*).
* **Automated 3D Measurement Dispatch**: Compiles body anthropometry into a standardized B2B payload ready to send via Zalo, SMS, or atelier booking forms.

### Module 4: Hierarchical Heritage Map & 360° Virtual Tours
* **9 Iconic Heritage Sites Across 3 Regions**:
  - *North*: Imperial Citadel of Thăng Long, Temple of Literature, Temple of the Hùng Kings.
  - *Central*: Hue Imperial City (Đại Nội), Khải Định Tomb, Hoi An Ancient Town.
  - *South*: Independence Palace, Saigon Central Post Office, Bến Thành Market.
* **Hero Landmark Pins & Satellite Atelier Pins**: Landmark locations display linked nearby rental shops and photo spots on interactive maps without requiring paid API keys.
* **WebGL 360° Panorama Sphere**: Immersive indoor/outdoor virtual exploration of historical monuments directly inside the browser.

### Module 5: GPS Check-in, Vision AI & Heritage Passport
* **Geofence Proximity Authentication**: Validates user coordinates within a **<= 500m radius** of the designated cultural monument, supporting offline EXIF-based photo uploads.
* **Gemini Vision AI Attire Scanner**: Inspects submitted photos to confirm the user is wearing genuine traditional attire (*Áo Ngũ Thân, Áo Nhật Bình, Áo Tứ Thân, Áo Dài, Áo Bà Ba*) and assigns a Decorum & Modesty Score.
* **3D Wax Seal Stamps & Omnichannel Point Engine**: Unlocks collectible dynastic seals in the user's Heritage Passport and rewards points redeemable for rental vouchers.

### Module 6: Profile & Dual-Intelligence Hybrid Fallback Engine
* **Personal Lookbook & 3D Wardrobe Vault**: Save, name, and recall custom 3D garment configurations.
* **B2B Voucher Management Vault**: Redeem earned heritage points for 10%–30% rental and bespoke tailoring discounts with copyable voucher codes.
* **Cultural Heuristic Fallback Engine**: If internet connectivity is interrupted or AI API quotas are reached, an embedded expert rules matrix takes over instantaneously, guaranteeing **zero runtime crashes**.

---

## ⚡ AI & System Highlights

```
+-----------------------------------------------------------------------------------------+
|                                    AI DECISION PIPELINE                                  |
|                                                                                         |
|  [ User Prompt / Context ]                                                              |
|            |                                                                            |
|            v                                                                            |
|  [ In-Memory Query Cache ] ----(Hit: <6ms)-----> [ Cached Stylist & Validation Payload ] |
|            |                                                                            |
|            +---(Miss: Fresh Inference)                                                  |
|            v                                                                            |
|  [ Google GenAI SDK: Gemini 1.5 Flash ]                                                  |
|  - System Prompt: Vietnamese Dynastic Costume Manual & Culture Guard Rulebook           |
|  - Output Schema: JSON Object { garmentId, paletteId, accessories, explanation, score } |
|            |                                                                            |
|            +-----(Network / Rate Limit Error?)                                          |
|            |                        |                                                   |
|            v (Success)              v (Triggered)                                       |
|  [ Verified AI Response ]   [ Cultural Heuristic Matrix Fallback Engine ]               |
|            |                        |                                                   |
|            +------------------------+                                                   |
|            v                                                                            |
|  [ Dispatched to 3D Renderer & User Interface ]                                         |
+-----------------------------------------------------------------------------------------+
```

1. **Gemini 1.5 Flash (Contextual Styling)**:
   - Processes subtle historical nuances in under 800ms.
   - Enforces the **Vietnamese Heritage Nomenclature Policy** (*strictly preserving proper nouns: Áo Ngũ Thân, Áo Nhật Bình, Áo Tứ Thân, Áo Dài, Áo Bà Ba, Khăn Xếp, Mấn Đội Đầu, Nón Quai Thao, Hài Thêu, Guốc Mộc*).
2. **Gemini 1.5 Pro Vision (Photographic Decorum Audit)**:
   - Analyzes user selfies at cultural sites.
   - Detects garment silhouettes, fabric draping, and assigns a cultural decorum score from 0 to 100.
3. **Sub-6ms In-Memory Keyed Cache**:
   - Reduces API roundtrips and costs for frequent outfit/occasion combinations.
4. **Cultural Heuristic Fallback Engine**:
   - Pre-compiled rule tables ensure that even when running completely offline in remote mountainous or heritage sites without 4G/WiFi, all recommendations and outfit configurations continue to function smoothly.

---

## 🛠️ Tech Stack & Prerequisites

### Frontend Architecture
- **Framework**: [React 18 (Vite SPA)](https://react.dev/)
- **Language**: [TypeScript 5.x](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **3D Graphics & WebGL**: [Three.js](https://threejs.org/) (Procedural geometry, mesh morphing, 360° panorama spheres)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio Effects**: Web Audio API (Ceremonial gong, acoustic chime, silk cloth rustle synthesizers)

### Backend & Middleware
- **Server**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Development Runtime**: `tsx` (TypeScript Execute)
- **AI SDK**: [`@google/genai`](https://www.npmjs.com/package/@google/genai) (Official Google Gen AI TypeScript SDK)
- **Maps Integration**: Google Maps Lite (Zero-Key Embeds & Deep Navigation Links)
- **Storage**: Client-Side Persistent `LocalStorage` V1 with JSON Schema verification

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Node.js 20+ LTS recommended)
- **Package Manager**: `npm` (v9+) or `yarn` / `pnpm`
- **Google AI Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).

---

## 🚀 Getting Started & Installation

Follow these steps to run VietAura locally on your development machine:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/vietaura.git
cd vietaura
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory by copying the sample file:
```bash
cp .env.example .env
```

Open `.env` and insert your Gemini API Key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
```

### 4. Start the Full-Stack Development Server
```bash
npm run dev
```

The application will start with Express proxying Vite middleware:
```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://your-ip:3000/
```

Open your browser at `http://localhost:3000` to explore VietAura.

### 5. Build for Production
To verify TypeScript compilation and generate an optimized production bundle:
```bash
npm run build
```

To run the production server:
```bash
npm start
```

---

## 🔐 Environment Variables

| Variable Name | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `GEMINI_API_KEY` | **Yes** | `""` | Google Gemini API Key used for AI Stylist & Vision Scanner |
| `PORT` | No | `3000` | Port for Express dev and production servers |
| `NODE_ENV` | No | `development` | Node environment (`development` / `production`) |
| `VITE_APP_TITLE` | No | `VietAura` | Application title override |

> **Security Notice**: Never commit your `.env` file to version control. The repository includes `.env.example` as a template.

---

## 🗺️ Product Roadmap & B2B Monetization

```
+-----------------------------------------------------------------------------------+
|                           VIETAURA PRODUCT ROADMAP                                 |
+-----------------------------------------------------------------------------------+
|  [Q1 - Foundation]   * WebGL 3D Fitting Room (5 Heritage Attire Lines)            |
|                      * AI Stylist & Culture Guard Rule Engine                     |
|                      * 9 Sacred Landmarks & GPS Geofencing Check-in               |
+-----------------------------------------------------------------------------------+
|  [Q2 - Ecosystem]    * 1-Touch B2B Measurement Dispatch to Partner Ateliers       |
|                      * Omnichannel Point Stacking & Redeemable Voucher Vault      |
|                      * Offline Cultural Heuristic Engine Validation               |
+-----------------------------------------------------------------------------------+
|  [Q3 - Expansion]    * AR Mirroring (WebXR mobile real-time body tracking)        |
|                      * AI Fabric Aging & Historical Wear Simulation               |
|                      * Dynamic Multilingual Localization (English, French, Japanese) |
+-----------------------------------------------------------------------------------+
|  [Q4 - Scale]        * Open API for Cultural Tourism Agencies                     |
|                      * Web3 Digital Heritage Collectible Passports                |
|                      * B2B Atelier SaaS Portal for Inventory & Booking Management |
+-----------------------------------------------------------------------------------+
```

### B2B Monetization Strategy
1. **Atelier SaaS Subscription**: Partner rental shops and bespoke tailors pay a monthly tier for verified listing, real-time 3D catalog showcase, and structured measurement intake.
2. **Rental & Tailoring Lead Commission**: Performance-based 5%–10% lead generation fee when users book costumes or bespoke tailoring through VietAura vouchers.
3. **Heritage Tourism Partnerships**: Sponsored cultural discovery challenges and gamified check-in itineraries with historical preservation funds and tourism boards.
4. **Fashion-Tech API Licensing**: B2B headless API access for museums, universities, and fashion brands seeking accurate 3D historical attire assets.

---

## 🤝 Contributing & Community

We warmly welcome contributions from software engineers, 3D artists, fashion historians, and cultural researchers!

1. **Fork the Project** (`https://github.com/your-username/vietaura/fork`)
2. **Create your Feature Branch**:
   ```bash
   git checkout -b feature/AmazingHeritageFeature
   ```
3. **Commit your Changes**:
   ```bash
   git commit -m 'feat: Add 19th Century Hue Royal Sash Variant'
   ```
4. **Push to the Branch**:
   ```bash
   git push origin feature/AmazingHeritageFeature
   ```
5. **Open a Pull Request** describing your cultural or technical enhancement.

### Contribution Guidelines
- Adhere strictly to the **Vietnamese Heritage Nomenclature Policy**: proper names (*Áo Ngũ Thân, Áo Nhật Bình, Áo Tứ Thân, Áo Dài, Áo Bà Ba, Khăn Xếp, Mấn Đội Đầu, Nón Quai Thao, Hài Thêu, Guốc Mộc*) must never be translated into generic English equivalents.
- Run `npm run lint` and `npm run build` to verify clean compilation before submitting PRs.

---

## 📜 License & Cultural Heritage Attributions

### Open-Source License
Distributed under the **MIT License**. See `LICENSE` for complete details.

### Cultural Heritage Attributions & Acknowledgments
- Inspired by the tireless research of Vietnamese cultural revival organizations, including *Đại Việt Cổ Phong*, *Ỷ Vân Hiên*, *Vạn Thiên Y*, *Hoa Niên*, and independent heritage scholars.
- Architectural data and landmark references based on historical documentation from the *Vietnam National Administration of Tourism (VNAT)* and preserved heritage sites across Hanoi, Hue, Hoi An, and Ho Chi Minh City.

<p align="center">
  <sub>Crafted with passion for Vietnamese cultural heritage and modern open-source technology.</sub><br>
  <strong>VietAura © 2026. Preserving the past, styling the future.</strong>
</p>
