# Precium Architecture Diagrams

This document contains ASCII diagrams of the Precium system architecture.

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────┐         ┌──────────────────────────────┐  │
│  │   Web Application       │         │   Mobile Applications        │  │
│  │   (React + TypeScript)  │         │   (React Native + TS)        │  │
│  │                         │         │                              │  │
│  │  • Product Search       │         │  • iOS Application          │  │
│  │  • Store Finder         │         │  • Android Application      │  │
│  │  • Map View             │         │  • Receipt Scanner          │  │
│  │  • Shopping Lists       │         │  • GPS Navigation           │  │
│  │  • Route Planning       │         │  • Push Notifications       │  │
│  │  • User Dashboard       │         │  • Offline Support          │  │
│  └─────────────────────────┘         └──────────────────────────────┘  │
│                                                                           │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    │
                         HTTPS / WebSocket
                                    │
┌───────────────────────────────────┴───────────────────────────────────────┐
│                           API GATEWAY LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               Load Balancer (NGINX)                              │  │
│  │  • SSL/TLS Termination                                           │  │
│  │  • Request Routing                                               │  │
│  │  • Rate Limiting                                                 │  │
│  │  • DDoS Protection                                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴───────────────────────────────────────┐
│                        APPLICATION LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              Backend API (Node.js + TypeScript + NestJS)         │  │
│  │                                                                   │  │
│  │  ┌────────────────┐  ┌──────────────┐  ┌──────────────────┐    │  │
│  │  │ Auth Service   │  │Search Service│  │ Product Service  │    │  │
│  │  │ • OAuth2/JWT   │  │• Location    │  │ • CRUD           │    │  │
│  │  │ • Passport.js  │  │• Radius      │  │ • Categories     │    │  │
│  │  │ • Sessions     │  │• Filters     │  │ • Search         │    │  │
│  │  └────────────────┘  └──────────────┘  └──────────────────┘    │  │
│  │                                                                   │  │
│  │  ┌────────────────┐  ┌──────────────┐  ┌──────────────────┐    │  │
│  │  │ Store Service  │  │Price Service │  │ Route Service    │    │  │
│  │  │ • Locations    │  │• History     │  │ • TSP Algorithm  │    │  │
│  │  │ • Hours        │  │• Trends      │  │ • Optimization   │    │  │
│  │  │ • Chains       │  │• Alerts      │  │ • Directions     │    │  │
│  │  └────────────────┘  └──────────────┘  └──────────────────┘    │  │
│  │                                                                   │  │
│  │  ┌────────────────┐  ┌──────────────┐  ┌──────────────────┐    │  │
│  │  │ OCR Service    │  │Promotion Svc │  │Notification Svc  │    │  │
│  │  │ • Vision API   │  │• Deals       │  │ • Push           │    │  │
│  │  │ • Parser       │  │• Expiry      │  │ • Email          │    │  │
│  │  │ • Validation   │  │• Conditions  │  │ • In-App         │    │  │
│  │  └────────────────┘  └──────────────┘  └──────────────────┘    │  │
│  │                                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴───────────────────────────────────────┐
│                           DATA LAYER                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────┐  │
│  │   PostgreSQL     │  │      Redis       │  │  Object Storage     │  │
│  │   + PostGIS      │  │   (Cache/Queue)  │  │   (S3 / GCS)        │  │
│  │                  │  │                  │  │                     │  │
│  │ • Users          │  │ • Sessions       │  │ • Receipt Images    │  │
│  │ • Products       │  │ • Search Cache   │  │ • Product Images    │  │
│  │ • Stores         │  │ • Rate Limits    │  │ • User Uploads      │  │
│  │ • Prices         │  │ • Job Queue      │  │ • Backups           │  │
│  │ • Locations      │  │ • Leaderboards   │  │ • Logs              │  │
│  │ • Promotions     │  │                  │  │                     │  │
│  │ • Shopping Lists │  │                  │  │                     │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────────┘  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴───────────────────────────────────────┐
│                        EXTERNAL SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  • OAuth Providers: Google, Apple, GitHub                                │
│  • Google Vision API: OCR Processing                                     │
│  • Google Maps API: Geocoding, Directions, Places                        │
│  • Push Notifications: FCM (Android), APNs (iOS)                         │
│  • Email Service: SendGrid / AWS SES                                     │
│  • Monitoring: Datadog / New Relic                                       │
│  • Error Tracking: Sentry                                                │
│  • Analytics: Mixpanel / Amplitude                                       │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

```
precium/ (root)
│
├── apps/                              📱 Applications
│   ├── backend/                       🔧 NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/                 🔐 Authentication
│   │   │   ├── users/                👤 User Management
│   │   │   ├── products/             📦 Product Catalog
│   │   │   ├── stores/               🏪 Store Management
│   │   │   ├── prices/               💰 Price Tracking
│   │   │   ├── search/               🔍 Search Engine
│   │   │   ├── routes/               🗺️  Route Optimization
│   │   │   ├── shopping-lists/       📝 Shopping Lists
│   │   │   ├── ocr/                  📸 Receipt Scanning
│   │   │   ├── promotions/           🎁 Promotions
│   │   │   └── notifications/        🔔 Notifications
│   │   ├── test/
│   │   └── package.json
│   │
│   ├── web/                           🌐 React Web App
│   │   ├── src/
│   │   │   ├── components/           🧩 UI Components
│   │   │   ├── pages/                📄 Page Components
│   │   │   ├── hooks/                🪝 Custom Hooks
│   │   │   ├── services/             🔌 API Services
│   │   │   ├── store/                💾 State Management
│   │   │   └── utils/                🛠️  Utilities
│   │   └── package.json
│   │
│   └── mobile/                        📱 React Native App
│       ├── src/
│       │   ├── components/
│       │   ├── screens/
│       │   ├── navigation/
│       │   ├── services/
│       │   └── utils/
│       ├── ios/                       🍎 iOS Native
│       ├── android/                   🤖 Android Native
│       └── package.json
│
├── packages/                          📦 Shared Packages
│   ├── shared-types/                  📋 TypeScript Types
│   ├── validation/                    ✅ Validation Schemas
│   ├── api-client/                    🔌 API Client
│   ├── ui-components/                 🎨 Shared UI Components
│   └── utils/                         🔧 Utility Functions
│
├── docs/                              📚 Documentation
│   ├── 00-EXECUTIVE-SUMMARY.md
│   ├── 01-TECHNOLOGY-STACK-ANALYSIS.md
│   ├── 02-MONOREPO-VS-MULTIREPO-STRATEGY.md
│   ├── 03-SYSTEM-ARCHITECTURE.md
│   ├── 04-API-CONTRACTS.md
│   ├── 05-IMPLEMENTATION-ROADMAP.md
│   ├── 06-FOLDER-STRUCTURE-AND-BEST-PRACTICES.md
│   ├── 07-DEVELOPMENT-GUIDELINES.md
│   └── 08-CI-CD-STRATEGY.md
│
├── scripts/                           🔧 Build Scripts
│   ├── setup.sh
│   ├── seed-database.ts
│   └── deploy.sh
│
├── .github/                           ⚙️  GitHub Config
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-backend.yml
│       ├── deploy-web.yml
│       └── build-mobile.yml
│
├── docker-compose.yml                 🐳 Local Development
├── package.json                       📦 Root Package
├── turbo.json                         ⚡ Turborepo Config
├── tsconfig.base.json                 📘 TypeScript Config
└── README.md                          📖 Project README
```

## Data Flow Diagrams

### User Search Flow

```
┌──────┐
│ User │
└──┬───┘
   │ 1. Open app & enable location
   ▼
┌─────────────┐
│ Mobile/Web  │
└──────┬──────┘
       │ 2. Enter search query + GPS coordinates
       ▼
┌──────────────────┐
│ Search Service   │
└──────┬───────────┘
       │ 3. Query products & stores within radius
       ▼
┌──────────────────┐
│ PostgreSQL       │◄──── PostGIS spatial query
│ + PostGIS        │
└──────┬───────────┘
       │ 4. Return matching results with distances
       ▼
┌──────────────────┐
│ Redis Cache      │◄──── Cache results for 5 minutes
└──────┬───────────┘
       │ 5. Results with prices & distances
       ▼
┌──────────────────┐
│ Client           │
└──────┬───────────┘
       │ 6. Display on map/list
       ▼
┌──────┐
│ User │ ◄──── Select best option
└──────┘
```

### Route Optimization Flow

```
┌──────┐
│ User │
└──┬───┘
   │ 1. Create shopping list
   ▼
┌─────────────┐
│ Client      │
└──────┬──────┘
       │ 2. Request route optimization
       │    (products + location + mode)
       ▼
┌──────────────────┐
│ Route Service    │
└──────┬───────────┘
       │ 3. Find stores with products
       ▼
┌──────────────────┐
│ Search Service   │
└──────┬───────────┘
       │ 4. Get stores & prices
       ▼
┌──────────────────┐
│ Database         │
└──────┬───────────┘
       │ 5. Return stores with availability
       ▼
┌──────────────────┐
│ Route Service    │
└──────┬───────────┘
       │ 6. Run TSP algorithm
       │    (Nearest Neighbor + 2-opt)
       ▼
┌──────────────────┐
│ Google Maps API  │
└──────┬───────────┘
       │ 7. Get directions & distances
       ▼
┌──────────────────┐
│ Route Service    │
└──────┬───────────┘
       │ 8. Calculate total cost & time
       ▼
┌──────────────────┐
│ Client           │
└──────┬───────────┘
       │ 9. Display optimized route on map
       ▼
┌──────┐
│ User │ ◄──── Follow turn-by-turn navigation
└──────┘
```

### Receipt Scanning Flow

```
┌──────┐
│ User │
└──┬───┘
   │ 1. Take photo of receipt
   ▼
┌─────────────┐
│ Mobile App  │
└──────┬──────┘
       │ 2. Upload image
       ▼
┌──────────────────┐
│ Backend API      │
└──────┬───────────┘
       │ 3. Store image in S3
       ▼
┌──────────────────┐
│ Object Storage   │
└──────┬───────────┘
       │ 4. Create OCR job
       ▼
┌──────────────────┐
│ OCR Service      │
└──────┬───────────┘
       │ 5. Send to Vision API
       ▼
┌──────────────────┐
│ Google Vision    │
└──────┬───────────┘
       │ 6. Return extracted text
       ▼
┌──────────────────┐
│ Receipt Parser   │
└──────┬───────────┘
       │ 7. Parse products, prices, store
       │    Match with database
       ▼
┌──────────────────┐
│ Database         │
└──────┬───────────┘
       │ 8. Create pending price updates
       ▼
┌──────────────────┐
│ Review Queue     │
└──────┬───────────┘
       │ 9. Notify user of results
       ▼
┌──────────────────┐
│ Client           │
└──────┬───────────┘
       │ 10. User reviews & approves
       ▼
┌──────────────────┐
│ Database         │ ◄──── Update prices
└──────────────────┘
```

## Deployment Architecture

### Production Environment

```
┌───────────────────────────────────────────────────────────┐
│                      Internet                              │
└────────────────────────┬──────────────────────────────────┘
                         │
┌────────────────────────┴──────────────────────────────────┐
│                    CloudFlare CDN                          │
│  • DDoS Protection                                         │
│  • SSL/TLS                                                 │
│  • Static Assets                                           │
└────────────────────────┬──────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼────────┐           ┌──────────▼─────────┐
│  Vercel/Netlify │           │   AWS / GCP / Azure │
│  (Web Frontend) │           │   (Backend + DB)    │
└─────────────────┘           └──────────┬──────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
          ┌─────────▼────────┐  ┌────────▼────────┐  ┌───────▼───────┐
          │  Load Balancer   │  │   PostgreSQL    │  │     Redis     │
          │     (NGINX)      │  │   (Managed)     │  │   (Managed)   │
          └─────────┬────────┘  └─────────────────┘  └───────────────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
    ┌────▼───┐ ┌───▼────┐ ┌───▼────┐
    │ API-1  │ │ API-2  │ │ API-3  │
    │(Docker)│ │(Docker)│ │(Docker)│
    └────────┘ └────────┘ └────────┘
         │          │          │
         └──────────┼──────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
    ┌────▼───────┐      ┌──────▼──────┐
    │ Monitoring │      │   Logging   │
    │  Datadog   │      │ CloudWatch  │
    └────────────┘      └─────────────┘
```

## CI/CD Pipeline

```
┌──────────────┐
│ Developer    │
└──────┬───────┘
       │ git push
       ▼
┌─────────────────────────────────────────────────────────┐
│              GitHub Actions Pipeline                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Stage 1: Validation ✓                                  │
│  ├─ Checkout code                                       │
│  ├─ Install dependencies                                │
│  ├─ Lint (ESLint)                                       │
│  └─ Type check (TypeScript)                             │
│                                                          │
│  Stage 2: Testing ✓                                     │
│  ├─ Unit tests (Jest)                                   │
│  ├─ Integration tests                                   │
│  ├─ E2E tests (Playwright)                              │
│  └─ Coverage report (Codecov)                           │
│                                                          │
│  Stage 3: Build ✓                                       │
│  ├─ Build backend                                       │
│  ├─ Build web                                           │
│  └─ Build Docker images                                 │
│                                                          │
│  Stage 4: Security ✓                                    │
│  ├─ Dependency scan (Snyk)                              │
│  ├─ Container scan (Trivy)                              │
│  └─ SAST scan (CodeQL)                                  │
│                                                          │
│  Stage 5: Deploy ✓                                      │
│  ├─ Push to container registry                          │
│  ├─ Update ECS/K8s                                      │
│  ├─ Run smoke tests                                     │
│  └─ Notify team (Slack)                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│ Production   │
└──────────────┘
```

---

**Last Updated**: 2026-02-08  
**Version**: 1.0
