# Precium - Smart Price Comparison Application

> A location-based price comparison platform that helps users find the best deals, optimize shopping routes, and contribute price data through receipt scanning.

## 🎯 Project Status

**Current Phase**: Planning & Architecture ✅  
**Next Phase**: Implementation (Iteration 1)

## 📋 Overview

Precium is a comprehensive price comparison application that combines:

- **Location-Based Search**: Find products and stores near you
- **Smart Route Optimization**: Plan efficient shopping trips
- **Receipt Scanning**: Contribute prices via OCR technology
- **Multi-Platform**: Web, iOS, and Android applications

## 🏗️ Architecture

This project uses a **monorepo** structure with the following tech stack:

- **Backend**: Node.js + TypeScript + NestJS
- **Frontend Web**: React + TypeScript + Tailwind CSS
- **Mobile**: React Native + TypeScript
- **Database**: PostgreSQL + PostGIS
- **Cache**: Redis
- **Monorepo Tool**: Turborepo

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

1. **[Technology Stack Analysis](docs/01-TECHNOLOGY-STACK-ANALYSIS.md)** - Node.js vs Golang comparison
2. **[Monorepo Strategy](docs/02-MONOREPO-VS-MULTIREPO-STRATEGY.md)** - Repository structure decisions
3. **[System Architecture](docs/03-SYSTEM-ARCHITECTURE.md)** - Complete system design
4. **[API Contracts](docs/04-API-CONTRACTS.md)** - REST API specifications
5. **[Implementation Roadmap](docs/05-IMPLEMENTATION-ROADMAP.md)** - 6-iteration development plan
6. **[Folder Structure & Best Practices](docs/06-FOLDER-STRUCTURE-AND-BEST-PRACTICES.md)** - Code organization
7. **[CI/CD Strategy](docs/08-CI-CD-STRATEGY.md)** - Deployment pipeline

## 🚀 Quick Start (Coming Soon)

The project structure will be set up in Iteration 1. Once complete:

```bash
# Clone the repository
git clone https://github.com/johnny4young/precium.git
cd precium

# Install dependencies
npm install

# Start development environment
docker-compose up -d
npm run dev
```

## 📦 Project Structure (Planned)

```
precium/
├── apps/
│   ├── backend/          # NestJS API
│   ├── web/              # React web application
│   └── mobile/           # React Native mobile app
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   ├── validation/       # Validation schemas
│   ├── api-client/       # API client library
│   ├── ui-components/    # Shared UI components
│   └── utils/            # Utility functions
├── docs/                 # Documentation
└── scripts/              # Build and deployment scripts
```

## 🎯 Key Features

### Phase 1 (MVP)
- ✅ User authentication (Google OAuth)
- ✅ Product search by location
- ✅ Store discovery
- ✅ Price comparison
- ✅ Shopping lists

### Phase 2
- 📋 Route optimization (2 modes)
- 📋 Receipt scanning (OCR)
- 📋 Price history tracking
- 📋 Promotions display

### Phase 3 (Future)
- 📋 Social features
- 📋 Price alerts
- 📋 Multi-language support
- 📋 Advanced analytics

## 🛠️ Technology Decisions

### Why Node.js?
- Unified language across stack (TypeScript)
- Rich ecosystem for rapid development
- Easy code sharing between platforms
- Fast time-to-market

### Why Monorepo?
- Simplified dependency management
- Atomic cross-platform changes
- Better code sharing
- Unified CI/CD

### Why React Native?
- Code sharing with web application
- Single team for all platforms
- Native performance
- Strong community support

## 📈 Implementation Roadmap

| Iteration | Duration | Focus Area | Status |
|-----------|----------|------------|--------|
| 1 | 4 weeks | Foundation & Auth | 🔜 Upcoming |
| 2 | 4 weeks | Core Search | 📅 Planned |
| 3 | 5 weeks | Shopping Lists | 📅 Planned |
| 4 | 5 weeks | Route Optimization | 📅 Planned |
| 5 | 5 weeks | Receipt Scanning | 📅 Planned |
| 6 | 5 weeks | Polish & Launch | 📅 Planned |

**Total Estimated Time**: 24-30 weeks

## 🤝 Contributing

This project is currently in the planning phase. Contribution guidelines will be added in Iteration 1.

## 📄 License

TBD

## 👥 Team

- Project Lead: [To be assigned]
- Backend Developer: [To be assigned]
- Frontend Developer: [To be assigned]
- Mobile Developer: [To be assigned]
- DevOps Engineer: [To be assigned]

## 📞 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Last Updated**: 2026-02-08  
**Version**: 0.1.0 (Planning Phase)  
**Status**: Architecture & Planning Complete ✅
