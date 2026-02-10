# Precium Project - Executive Summary

## Project Overview

**Precium** is a comprehensive location-based price comparison application designed to help users find the best prices for products in nearby stores, optimize shopping routes, and contribute price data through innovative receipt scanning technology.

## Vision

To create the most user-friendly and accurate price comparison platform that saves users time and money while building a community-driven database of real-time pricing information.

## Key Features

### Core Functionality
1. **Location-Based Product Search** - Find products in nearby stores using GPS
2. **Smart Price Comparison** - Real-time price analysis across multiple retailers
3. **Advanced Fuzzy Search** - Typo-tolerant search supporting Spanish language variations (huevos, huebos, uevos)
4. **Intelligent Autocomplete** - Search history + popular searches + contextual suggestions
5. **Route Optimization** - AI-powered shopping route planning (minimum distance or best prices)
6. **Receipt Scanning** - OCR technology for easy price contributions
7. **Shopping Lists** - Organized list management with cost estimation
8. **Promotions** - Real-time deals and special offers
9. **Monetization Features** - Freemium model with subscriptions, ads, and store promotions

### Platform Support
- **Web Application** - Desktop and mobile browsers
- **iOS Application** - Native mobile experience
- **Android Application** - Native mobile experience

## Technology Stack

### Recommended Architecture

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Backend** | Golang 1.23+ with Fiber | Exceptional performance, native concurrency, microservices-ready |
| **Web Frontend** | React + TypeScript + Vite | Industry standard, ultra-fast builds |
| **Mobile** | React Native + TypeScript | Code sharing, cross-platform |
| **Database** | PostgreSQL 17 + PostGIS 3.4 + Extensions | Latest version, GIS support, pg_trgm for fuzzy search, unaccent for Spanish |
| **Query Builder** | SQLC | Type-safe Go code from SQL, perfect for Golang |
| **Cache** | Redis 7+ | Performance optimization |
| **Repository** | Monorepo with npm workspaces | Native, simple, no extra tooling |
| **Build Tool** | Vite 6+ | Lightning-fast frontend builds |
| **API Gateway** | Traefik (reverse proxy) | Simple, lightweight - no complex gateway needed initially |
| **Authentication** | Custom Golang OAuth2 + JWT | Lightweight, performant, full control |
| **CI/CD** | GitHub Actions | Native integration, flexible |
| **Hosting** | Cloud (AWS/GCP/Azure) | Scalability, managed services |

### Key Technical Decisions

1. **Golang for Backend**: Exceptional performance (10-100x faster for algorithms), native concurrency with goroutines, perfect for microservices, lower costs
   - Single binary deployment, no dependency hell
   - Built-in concurrency for handling 50K+ concurrent users
   
2. **SQLC over ORMs**: Type-safe Go code generated from SQL, no ORM overhead, compile-time query validation
   - Write pure SQL, get type-safe Go code
   - Perfect for Golang projects
   
3. **Fuzzy Search with pg_trgm**: PostgreSQL's trigram extension for typo-tolerant search
   - Handles Spanish language variations and typos
   - Fast with GIN indexes, no external dependencies
   - Implemented in Iteration 1
   
4. **Simple Architecture (No API Gateway Initially)**: Direct backend with Fiber middleware
   - Traefik as lightweight reverse proxy
   - Add full API Gateway (Kong) only if needed later
   - Reduces complexity for MVP
   
5. **Custom Authentication (Not Keycloak)**: Golang OAuth2 + JWT for lightweight auth
   - No JVM overhead, faster performance
   - Full control over auth flow
   - Can migrate to Keycloak later if enterprise features needed
   
6. **npm workspaces + Vite over Turborepo**: Native npm feature, simpler for mixed-language monorepos (Go + TypeScript), Vite provides ultra-fast builds
   - No extra dependencies or complex configuration
   - Sufficient for our team size and requirements
   
7. **REST over tRPC/GraphQL**: Universal compatibility, simple debugging, HTTP caching
   - tRPC requires TypeScript backend (not compatible with Golang)
   - gRPC reserved for internal service-to-service communication
   
8. **Freemium Monetization Model**: Free tier with ads, premium subscriptions, store promotions
   - Multiple revenue streams
   - Scalable business model

## Project Structure

```
precium/
├── apps/
│   ├── backend/          # Golang API with Fiber framework
│   │   ├── cmd/api/      # Main application entry
│   │   ├── internal/     # Internal packages
│   │   │   ├── handlers/ # HTTP handlers
│   │   │   ├── services/ # Business logic
│   │   │   ├── models/   # Data models
│   │   │   └── db/       # SQLC generated code
│   │   ├── migrations/   # SQL migrations
│   │   ├── queries/      # SQL queries for SQLC
│   │   └── go.mod
│   ├── web/              # React + Vite web application
│   └── mobile/           # React Native (iOS + Android)
├── packages/
│   ├── shared-types/     # TypeScript type definitions (generated from OpenAPI)
│   ├── validation/       # Validation schemas (Zod)
│   ├── api-client/       # API client library
│   ├── ui-components/    # Shared UI components
│   └── utils/            # Utility functions
├── docs/                 # Comprehensive documentation
│   ├── 11-ADDITIONAL-REQUIREMENTS-ANALYSIS.md  # New requirements
└── scripts/              # Build and deployment scripts
```

## Implementation Plan

### Timeline: 24-30 Weeks (6 Iterations)

| Iteration | Duration | Deliverable | Status |
|-----------|----------|-------------|--------|
| **Iteration 1** | 4 weeks | Foundation & Authentication | 🔜 Next |
| **Iteration 2** | 4 weeks | Core Search Features | 📅 Planned |
| **Iteration 3** | 5 weeks | Shopping Lists & Prices | 📅 Planned |
| **Iteration 4** | 5 weeks | Route Optimization | 📅 Planned |
| **Iteration 5** | 5 weeks | Receipt Scanning (OCR) | 📅 Planned |
| **Iteration 6** | 5 weeks | Polish & Production Launch | 📅 Planned |

### Iteration 1: Foundation & Authentication (Weeks 1-4)

**Week 1**: Project Setup
- Initialize monorepo with npm workspaces
- Set up Docker Compose for local development
- Configure PostgreSQL 17 + PostGIS + Redis 7
- Install PostgreSQL extensions: pg_trgm, unaccent, postgis
- Create initial database schema with SQLC
- Set up CI/CD pipeline with GitHub Actions
- Configure Traefik as reverse proxy

**Week 2**: Backend Foundation & Fuzzy Search ⭐ NEW
- Set up Golang + Fiber application structure
- Configure SQLC for type-safe database queries
- Implement database migrations with golang-migrate
- Create core tables: users, products, stores, prices
- **Implement fuzzy search with pg_trgm extension**
- **Add unaccent support for Spanish language**
- Set up logging and monitoring
- Create health check endpoints
- Test fuzzy search: "huebos" → "huevos", "uevos" → "huevos"

**Week 3**: Authentication System
- Implement JWT authentication in Golang
- Use golang-jwt library for token generation
- Integrate Google OAuth2 (golang.org/x/oauth2)
- Add email/password registration with bcrypt
- Implement refresh token mechanism
- **Add user_search_history table for autocomplete**
- Create auth middleware for protected routes

**Week 4**: Frontend Foundation & Search
- Set up React web app with Vite 6
- Create authentication pages
- Set up React Native mobile app
- Implement OAuth flows
- Create protected routes
- **Implement search interface with fuzzy matching**
- **Add autocomplete component with user history**
- Test search with various typos and accents

**Deliverable**: Working authentication system across all platforms

## System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Client Layer                           │
│  ┌─────────────────┐        ┌────────────────────────┐  │
│  │  Web App        │        │  Mobile Apps           │  │
│  │  (React)        │        │  (React Native)        │  │
│  └─────────────────┘        └────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                           │
                    HTTPS / WSS
                           │
┌──────────────────────────────────────────────────────────┐
│                   API Gateway                             │
│            (NGINX + Load Balancer)                        │
└──────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────────────────────────────────────┐
│                Backend Services                           │
│  ┌────────────┬──────────┬──────────┬────────────────┐  │
│  │ Auth       │ Search   │ Products │ Routes         │  │
│  │ Service    │ Service  │ Service  │ Service        │  │
│  └────────────┴──────────┴──────────┴────────────────┘  │
│  ┌────────────┬──────────┬──────────┬────────────────┐  │
│  │ Stores     │ Prices   │ OCR      │ Notifications  │  │
│  │ Service    │ Service  │ Service  │ Service        │  │
│  └────────────┴──────────┴──────────┴────────────────┘  │
└──────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────────────────────────────────────┐
│                    Data Layer                             │
│  ┌────────────┬──────────┬──────────────────────────┐   │
│  │ PostgreSQL │  Redis   │  Object Storage (S3/GCS) │   │
│  │ + PostGIS  │ (Cache)  │  (Images, Receipts)      │   │
│  └────────────┴──────────┴──────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────────────────────────────────────┐
│               External Services                           │
│  • OAuth Providers (Google, Apple, GitHub)               │
│  • Google Vision API (OCR)                                │
│  • Google Maps API (Routes, Geocoding)                    │
│  • Push Notifications (FCM, APNs)                         │
└──────────────────────────────────────────────────────────┘
```

## Database Design

### Core Entities

1. **Users** - User accounts and profiles
2. **Stores** - Physical store locations with coordinates
3. **Products** - Product catalog with categories
4. **Prices** - Current and historical pricing data
5. **Shopping Lists** - User shopping lists and items
6. **Promotions** - Deals and special offers
7. **Routes** - Optimized shopping routes
8. **OCR Jobs** - Receipt scanning jobs and results

### Key Database Features

- **PostGIS** for efficient location-based queries
- **Spatial Indexes** for fast distance calculations
- **Full-Text Search** for product search
- **Price History** for trend analysis
- **Materialized Views** for performance

## API Design

### RESTful API Structure

**Base URL**: `https://api.precium.com/api/v1`

### Main Endpoints

```
Authentication
POST   /auth/register
POST   /auth/login
GET    /auth/google
POST   /auth/refresh
GET    /auth/me

Search & Autocomplete
GET    /search/products?q=huevos&lat=40.7&lon=-74.0
GET    /search/autocomplete?q=huev&userId=:userId
GET    /search/history?userId=:userId
DELETE /search/history/:userId
GET    /search/stores
GET    /search/products/:id/stores

Products
GET    /products
GET    /products/:id
POST   /products (admin)

Stores
GET    /stores
GET    /stores/:id
GET    /stores/:id/products

Prices
GET    /prices/product/:productId/store/:storeId
GET    /prices/product/:productId/history
POST   /prices

Subscriptions & Monetization
GET    /subscriptions/plans
GET    /subscriptions/user/:userId
POST   /subscriptions/subscribe
POST   /subscriptions/cancel
POST   /subscriptions/upgrade
POST   /payments/create-intent
POST   /payments/webhook
GET    /payments/history

Advertisements (Store Owners)
POST   /ads/create
GET    /ads/:id
PUT    /ads/:id
DELETE /ads/:id
GET    /ads/analytics/:id
GET    /ads/display?location=lat,lon&type=banner
POST   /ads/:id/impression
POST   /ads/:id/click

Routes
POST   /routes/optimize
GET    /routes/:id

Shopping Lists
GET    /shopping-lists
POST   /shopping-lists
GET    /shopping-lists/:id
POST   /shopping-lists/:id/items

OCR
POST   /ocr/upload
GET    /ocr/jobs/:id
POST   /ocr/jobs/:id/review
```

## Security Considerations

### Authentication & Authorization
- JWT tokens with short expiry (15 minutes)
- Refresh tokens for session management
- OAuth2 for third-party authentication
- Role-based access control (User, Admin, Moderator)

### Data Security
- HTTPS/TLS for all communications
- Database encryption at rest
- Secure secret management
- Input validation and sanitization
- SQL injection prevention via SQLC (parameterized queries)
- XSS protection
- CSRF protection
- Rate limiting

### Authorization (Using Casbin)
- **Casbin** for flexible RBAC/ABAC authorization
- Policy-driven access control (config-based)
- Role hierarchies: user → premium_user → pro_user → admin
- Resource-level permissions (own shopping lists, own stores)
- Subscription tier enforcement middleware
- <1ms authorization checks (in-memory evaluation)
- PostgreSQL adapter for policy persistence
- Future-proof for complex ABAC scenarios
- See docs/12-CASBIN-AUTHORIZATION-ANALYSIS.md for details

### Privacy
- GDPR compliance
- User data anonymization
- Right to be forgotten
- Data export capabilities
- Clear privacy policy

## Performance Targets

### Backend
- API Response Time: < 200ms (p95)
- Database Query Time: < 50ms (p95)
- Concurrent Users: 10,000+
- Uptime: 99.9%

### Frontend
- First Contentful Paint: < 2s
- Time to Interactive: < 3s
- Lighthouse Score: > 90
- Bundle Size: < 300KB (initial)

### Mobile
- App Launch Time: < 2s
- Smooth 60 FPS scrolling
- Offline capability for key features
- Battery efficient

## Scalability Strategy

### Horizontal Scaling
- Stateless backend services
- Load balancer distribution
- Database read replicas
- Redis cluster for caching

### Future Optimization
- Golang microservices for performance-critical paths
- Elasticsearch for advanced search
- CDN for static assets
- Image optimization and lazy loading
- Progressive web app (PWA) capabilities

## Risk Management

### Technical Risks
1. **Route Optimization Performance**
   - Mitigation: Approximation algorithms, caching, Golang service if needed
   
2. **OCR Accuracy**
   - Mitigation: Google Vision API, community review system
   
3. **Database Performance**
   - Mitigation: Proper indexing, caching, query optimization

### Business Risks
1. **User Adoption**
   - Mitigation: Beta testing, user feedback, iterative improvements
   
2. **Data Quality**
   - Mitigation: Verification system, community moderation
   
3. **Store Relationships**
   - Mitigation: Focus on user-contributed data, clear terms of service

## Success Metrics

### Product Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- User Retention (Day 1, 7, 30)
- Shopping Lists Created
- Routes Optimized
- Receipt Scans Completed
- Price Contributions

### Technical Metrics
- API Response Times
- Error Rates
- Uptime
- Database Performance
- Cache Hit Rates
- Build Times

### Business Metrics
- User Acquisition Cost
- Customer Lifetime Value
- User Satisfaction Score
- Net Promoter Score (NPS): A metric measuring customer loyalty on a scale from -100 to +100, based on asking users "How likely are you to recommend this product?" Scores above 50 are considered excellent.

## Budget Estimates

### Development (6 months)
- 3-5 Developers
- Estimated: $150,000 - $300,000

### Infrastructure (Monthly)
- Cloud Hosting: $100-500
- Database: $50-200
- APIs (Maps, Vision): $200-800
- Monitoring: $50-100
- CDN: $20-50
- **Total**: $420-1,650/month

### Post-Launch (Monthly)
- Scaling costs based on usage
- Support team
- Ongoing development

## Team Requirements

### Core Team
- **1 Backend Developer** - Golang expert
- **1 Frontend Developer** - React specialist
- **1 Mobile Developer** - React Native expert
- **1 Full-Stack Developer** - Flexible support
- **0.5 DevOps Engineer** - Infrastructure and CI/CD

### Extended Team (Future)
- Product Manager
- UX/UI Designer
- QA Engineer
- Data Analyst
- Customer Support

## Next Steps

### Immediate Actions (Week 1)
1. ✅ Complete architecture documentation
2. ✅ Make technology stack decisions
3. ✅ Define implementation roadmap
4. 🔜 Get stakeholder approval
5. 🔜 Assemble development team
6. 🔜 Set up development environment
7. 🔜 Begin Iteration 1

### Stakeholder Decisions Needed
1. **Budget Approval** - Confirm development and infrastructure budget
2. **Timeline Approval** - Confirm 6-month development timeline
3. **Team Assembly** - Hire or assign development team
4. **Technology Stack** - Approve recommended technologies
5. **Feature Prioritization** - Confirm MVP feature set

## Documentation Index

All detailed documentation is available in the `/docs` directory:

1. **[Technology Stack Analysis](docs/01-TECHNOLOGY-STACK-ANALYSIS.md)** (10,000 words)
   - Node.js vs Golang comparison
   - Performance analysis
   - Recommendation and rationale

2. **[Monorepo Strategy](docs/02-MONOREPO-VS-MULTIREPO-STRATEGY.md)** (11,000 words)
   - Monorepo vs multi-repo analysis
   - Tooling recommendations (Turborepo)
   - Implementation strategy

3. **[System Architecture](docs/03-SYSTEM-ARCHITECTURE.md)** (19,000 words)
   - Complete system design
   - Service architecture
   - Database schema
   - Security architecture

4. **[API Contracts](docs/04-API-CONTRACTS.md)** (18,000 words)
   - REST API specifications
   - Data models
   - Request/response formats
   - Error handling

5. **[Implementation Roadmap](docs/05-IMPLEMENTATION-ROADMAP.md)** (19,000 words)
   - 6 iteration plan
   - Week-by-week breakdown
   - Resource requirements
   - Risk management

6. **[Folder Structure & Best Practices](docs/06-FOLDER-STRUCTURE-AND-BEST-PRACTICES.md)** (24,000 words)
   - Complete folder structure
   - Code organization
   - Naming conventions
   - Testing patterns

7. **[Development Guidelines](docs/07-DEVELOPMENT-GUIDELINES.md)** (15,000 words)
   - Getting started guide
   - Development workflow
   - Code style guide
   - Common issues and solutions

8. **[CI/CD Strategy](docs/08-CI-CD-STRATEGY.md)** (20,000 words)
   - GitHub Actions workflows
   - Deployment strategies
   - Quality gates
   - Monitoring and alerts

**Total Documentation**: ~136,000 words across 8 comprehensive documents

## Conclusion

The Precium project has been thoroughly analyzed and planned. With a solid technology foundation, clear architecture, and detailed implementation roadmap, the project is ready to move into the development phase.

The recommended approach of starting with Node.js in a monorepo structure provides the fastest path to market while maintaining the flexibility to optimize critical paths with Golang microservices in the future if needed.

The 6-iteration plan provides incremental value delivery, allowing for feedback and course correction throughout the development process.

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-08  
**Status**: ✅ Planning Phase Complete  
**Next Phase**: 🔜 Development (Iteration 1)  
**Estimated Start Date**: Upon stakeholder approval  
**Estimated Launch Date**: 6-7 months from start
