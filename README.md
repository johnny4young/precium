# Precium - Smart Price Comparison Application

> A location-based price comparison platform that helps users find the best deals, optimize shopping routes, and contribute price data through receipt scanning.

## 🎯 Project Status

**Current Phase**: Implementation (Iteration 1) 🚧  
**Status**: Foundation setup complete ✅

## 📋 Overview

Precium is a comprehensive price comparison application that combines:

- **Location-Based Search**: Find products and stores near you
- **Smart Route Optimization**: Plan efficient shopping trips
- **Receipt Scanning**: Contribute prices via OCR technology
- **Multi-Platform**: Web, iOS, and Android applications

## 🏗️ Architecture

This project uses a **monorepo** structure with the following tech stack:

- **Backend**: Golang 1.23+ with Fiber framework (high-performance)
- **Frontend Web**: React 19+ + TypeScript 5.7+ + Vite 7+ + Tailwind CSS 4+
- **Mobile**: React Native 0.76+ + TypeScript 5.7+
- **Database**: PostgreSQL 17+ with PostGIS 3.4, pg_trgm (fuzzy search), unaccent (Spanish)
- **Query Builder**: SQLC (type-safe Go code from SQL)
- **Cache**: Redis 7+
- **Monorepo Tool**: npm workspaces + Vite
- **Reverse Proxy**: Traefik (no complex API gateway initially)

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

1. **[Technology Stack Decision](docs/01-TECHNOLOGY-STACK-DECISION.md)** - Golang backend rationale
2. **[Monorepo Strategy](docs/02-MONOREPO-VS-MULTIREPO-STRATEGY.md)** - Repository structure with npm workspaces
3. **[System Architecture](docs/03-SYSTEM-ARCHITECTURE.md)** - Complete system design
4. **[API Contracts](docs/04-API-CONTRACTS.md)** - REST API specifications
5. **[Implementation Roadmap](docs/05-IMPLEMENTATION-ROADMAP.md)** - 6-iteration development plan
6. **[Folder Structure & Best Practices](docs/06-FOLDER-STRUCTURE-AND-BEST-PRACTICES.md)** - Code organization
7. **[CI/CD Strategy](docs/08-CI-CD-STRATEGY.md)** - Deployment pipeline
8. **[API Communication Analysis](docs/10-API-COMMUNICATION-ANALYSIS.md)** - REST vs gRPC vs tRPC vs GraphQL

## 🚀 Quick Start

Precium is a smart price comparison platform that helps users find the best deals on products across multiple stores. The application uses geolocation to show nearby stores, calculates optimal shopping routes, and allows users to contribute price data via receipt scanning.

### Prerequisites

- Node.js 24+ and npm 10+
- Go 1.23+
- Docker and Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/johnny4young/precium.git
cd precium

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials if needed

# Start development environment with Docker
docker-compose up -d

# Wait for PostgreSQL to be ready, then run migrations
cd apps/backend
migrate -path db/migrations -database "postgresql://precium:precium_dev@localhost:5432/precium_dev?sslmode=disable" up
cd ../..

# Or run services individually:

# 1. Start backend (Go)
cd apps/backend
cp .env.example .env
go run cmd/server/main.go

# 2. Start web frontend (React)
cd apps/web
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests
cd apps/backend
go test ./...

# Run frontend tests
cd apps/web
npm run test
```

### Building for Production

```bash
# Build all applications
npm run build

# Build backend binary
cd apps/backend
go build -o bin/server cmd/server/main.go

# Build web frontend
cd apps/web
npm run build
```

### Development

- **Backend API**: http://localhost:3001
- **Web Frontend**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Available Commands

```bash
# Install all dependencies
npm install

# Run all workspaces in dev mode
npm run dev

# Build all workspaces
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 📦 Project Structure (Planned)

```
precium/
├── apps/
│   ├── backend/          # Golang API with Fiber
│   ├── web/              # React + Vite web application
│   └── mobile/           # React Native mobile app
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   ├── validation/       # Validation schemas (Zod)
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

### Why Golang?

- Exceptional performance for route optimization algorithms
- Built-in concurrency with goroutines
- Fast compilation and deployment
- Strong typing and reliability
- Excellent for microservices architecture
- Lower resource consumption

### Why npm Workspaces + Vite?

- Native npm workspace support (no extra tooling)
- Vite for ultra-fast frontend builds
- Simpler setup and maintenance
- Modern build toolchain
- Better for mixed-language monorepos (Go + TypeScript)

### Why SQLC?

- Type-safe Go code generated from SQL
- Write pure SQL, get type-safe Go code
- Compile-time query validation
- No ORM overhead - just SQL
- Perfect for Golang projects
- Easy migrations with golang-migrate

### Communication Protocol

- **REST/JSON**: For all client-facing APIs (simple, universal, cacheable)
- **gRPC**: For internal service-to-service communication (when needed)
- See [API Communication Analysis](docs/10-API-COMMUNICATION-ANALYSIS.md) for detailed comparison

### Why React Native?

- Code sharing with web application
- Single team for all platforms
- Native performance
- Strong community support

## 📈 Implementation Roadmap

| Iteration | Duration | Focus Area         | Status         |
| --------- | -------- | ------------------ | -------------- |
| 1         | 4 weeks  | Foundation & Auth  | 🚧 In Progress |
| 2         | 4 weeks  | Core Search        | 📅 Planned     |
| 3         | 5 weeks  | Shopping Lists     | 📅 Planned     |
| 4         | 5 weeks  | Route Optimization | 📅 Planned     |
| 5         | 5 weeks  | Receipt Scanning   | 📅 Planned     |
| 6         | 5 weeks  | Polish & Launch    | 📅 Planned     |

**Total Estimated Time**: 24-30 weeks

## 🤝 Contributing

This project is currently in the planning phase. Contribution guidelines will be added in Iteration 1.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 👥 Team

- Project Lead: @johnny4young
- Backend Developer (Golang): [To be assigned]
- Frontend Developer (React): [To be assigned]
- Mobile Developer (React Native): [To be assigned]
- DevOps Engineer: [To be assigned]

## 📞 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Last Updated**: 2026-02-10  
**Version**: 0.1.0 (Iteration 1)  
**Status**: Foundation Setup Complete ✅
