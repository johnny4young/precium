# Precium System Architecture

## Executive Summary

Precium is a location-based price comparison application that helps users find the best prices for products in nearby stores, optimize shopping routes, and scan receipts to contribute price data.

## System Overview

### Core Features

1. **Location-Based Product Search**
   - GPS-based store discovery
   - Configurable search radius (default 1km)
   - Real-time price comparison
   - Promotion highlighting

2. **Smart Shopping Lists**
   - Multi-product shopping lists
   - Route optimization for shopping trips
   - Two optimization modes:
     - Minimum effort (shortest route)
     - Best prices (cheapest overall)

3. **Receipt Scanning**
   - Mobile photo capture
   - OCR processing
   - Automatic product/price extraction
   - Community-driven price updates

4. **User Management**
   - OAuth2 authentication (Google, Apple, GitHub)
   - User profiles and preferences
   - Shopping history
   - Saved lists and favorites

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────┐  ┌─────────────────────────────────┐   │
│  │   Web Application   │  │   Mobile Applications           │   │
│  │   (React + TS)      │  │   (React Native + TS)           │   │
│  │                     │  │                                 │   │
│  │  - Product Search   │  │  - iOS App                      │   │
│  │  - Map View         │  │  - Android App                  │   │
│  │  - Shopping Lists   │  │  - GPS Integration              │   │
│  │  - User Dashboard   │  │  - Receipt Scanner              │   │
│  └────────────────────┘  │  - Push Notifications           │   │
│                           └─────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                    HTTPS / WSS │
                                │
┌───────────────────────────────┴───────────────────────────────────┐
│                         API Gateway Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Load Balancer (NGINX)                       │   │
│  │  - SSL Termination                                       │   │
│  │  - Request Routing                                       │   │
│  │  - Rate Limiting                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
┌───────────────────────────────┴───────────────────────────────────┐
│                      Application Layer                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │          Backend API (Node.js + TypeScript)             │    │
│  │                                                          │    │
│  │  ┌────────────────┐  ┌──────────────┐  ┌────────────┐ │    │
│  │  │  Auth Service  │  │Search Service│  │Route Optim │ │    │
│  │  │  - OAuth2/JWT  │  │- Location    │  │- TSP Algo  │ │    │
│  │  │  - Passport.js │  │- Radius      │  │- Pathfind  │ │    │
│  │  └────────────────┘  └──────────────┘  └────────────┘ │    │
│  │                                                          │    │
│  │  ┌────────────────┐  ┌──────────────┐  ┌────────────┐ │    │
│  │  │ Product Service│  │ Store Service│  │OCR Service │ │    │
│  │  │  - CRUD        │  │- Locations   │  │- Receipt   │ │    │
│  │  │  - Search      │  │- Hours       │  │  Scanning  │ │    │
│  │  └────────────────┘  └──────────────┘  └────────────┘ │    │
│  │                                                          │    │
│  │  ┌────────────────┐  ┌──────────────┐  ┌────────────┐ │    │
│  │  │ Price Service  │  │Promotion Svc │  │Notification│ │    │
│  │  │  - History     │  │- Deals       │  │  Service   │ │    │
│  │  │  - Updates     │  │- Expiry      │  │- Push/Email│ │    │
│  │  └────────────────┘  └──────────────┘  └────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
┌───────────────────────────────┴───────────────────────────────────┐
│                         Data Layer                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌────────────────┐  ┌─────────────────┐ │
│  │   PostgreSQL     │  │     Redis      │  │  File Storage   │ │
│  │   + PostGIS      │  │   (Cache)      │  │   (S3/GCS)      │ │
│  │                  │  │                │  │                 │ │
│  │  - Users         │  │  - Sessions    │  │  - Receipts     │ │
│  │  - Products      │  │  - Search Cache│  │  - Images       │ │
│  │  - Stores        │  │  - Rate Limit  │  │  - Exports      │ │
│  │  - Prices        │  │  - Jobs Queue  │  │                 │ │
│  │  - Locations     │  │                │  │                 │ │
│  └──────────────────┘  └────────────────┘  └─────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      External Services                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  - OAuth Providers (Google, Apple, GitHub)                       │
│  - OCR Service (Google Vision API / AWS Textract)                │
│  - Map Services (Google Maps / Mapbox)                           │
│  - Push Notifications (FCM / APNs)                               │
│  - Email Service (SendGrid / SES)                                │
│  - Monitoring (Datadog / New Relic)                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Backend Services

#### 1. Authentication Service
**Responsibility**: User authentication and authorization

**Features**:
- OAuth2 integration (Google, Apple, GitHub)
- JWT token generation and validation
- Session management
- Password reset (for email/password accounts)
- Role-based access control (RBAC)

**Technologies**:
- Passport.js for OAuth strategies
- jsonwebtoken for JWT
- bcrypt for password hashing

**API Endpoints**:
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/google
GET    /auth/google/callback
GET    /auth/apple
GET    /auth/apple/callback
POST   /auth/refresh
GET    /auth/me
```

#### 2. Search Service
**Responsibility**: Location-based product and store search

**Features**:
- GPS coordinate-based queries
- Configurable radius search
- Product availability check
- Store filtering and sorting
- Full-text search

**Technologies**:
- PostGIS for geographic queries
- PostgreSQL full-text search
- Redis for caching frequent searches

**Key Algorithms**:
```typescript
// Distance calculation using PostGIS
SELECT s.*, 
       ST_Distance(
         ST_MakePoint(s.longitude, s.latitude)::geography,
         ST_MakePoint($userLon, $userLat)::geography
       ) as distance
FROM stores s
WHERE ST_DWithin(
  ST_MakePoint(s.longitude, s.latitude)::geography,
  ST_MakePoint($userLon, $userLat)::geography,
  $radiusMeters
)
ORDER BY distance
```

**API Endpoints**:
```
GET    /search/products?q=:query&lat=:lat&lon=:lon&radius=:radius
GET    /search/stores?lat=:lat&lon=:lon&radius=:radius
GET    /search/products/:id/stores?lat=:lat&lon=:lon
```

#### 3. Route Optimization Service
**Responsibility**: Calculate optimal shopping routes

**Features**:
- Minimum distance route (Shortest path)
- Best price route (Price optimization)
- Multi-store visits
- Real-time route updates

**Technologies**:
- Google Maps Directions API
- Custom TSP (Traveling Salesman Problem) solver
- Dijkstra's algorithm for pathfinding

**Algorithm Approach**:
```typescript
interface RouteOptimizationRequest {
  userLocation: Coordinates;
  products: string[];
  optimizationMode: 'distance' | 'price';
  maxStores?: number;
}

// Simplified TSP for small sets (< 10 stores)
// For larger sets, use approximation algorithms:
// - Nearest Neighbor
// - 2-opt optimization
// - Genetic algorithm (future)
```

**API Endpoints**:
```
POST   /routes/optimize
GET    /routes/:id
GET    /routes/:id/navigation
```

#### 4. Product Service
**Responsibility**: Product catalog management

**Features**:
- Product CRUD operations
- Product categorization
- Barcode management
- Product suggestions

**API Endpoints**:
```
GET    /products
GET    /products/:id
POST   /products
PUT    /products/:id
DELETE /products/:id
GET    /products/search
```

#### 5. Store Service
**Responsibility**: Store information management

**Features**:
- Store CRUD operations
- Operating hours
- Store amenities
- Store chain management

**API Endpoints**:
```
GET    /stores
GET    /stores/:id
POST   /stores
PUT    /stores/:id
DELETE /stores/:id
GET    /stores/:id/products
```

#### 6. Price Service
**Responsibility**: Price tracking and history

**Features**:
- Current price management
- Price history tracking
- Price alerts
- Price trend analysis

**API Endpoints**:
```
GET    /prices/product/:productId/store/:storeId
GET    /prices/product/:productId/history
POST   /prices
PUT    /prices/:id
GET    /prices/trends
```

#### 7. OCR Service
**Responsibility**: Receipt scanning and processing

**Features**:
- Image upload handling
- OCR processing (Google Vision API)
- Product/price extraction
- Validation and review
- Community contribution system

**Flow**:
```
1. User uploads receipt image
2. Image stored in S3/GCS
3. OCR service processes image
4. Extract products and prices
5. Match products in database
6. Create pending price updates
7. Admin/community review
8. Approve and update database
```

**API Endpoints**:
```
POST   /ocr/upload
GET    /ocr/jobs/:id
POST   /ocr/jobs/:id/review
GET    /ocr/pending
```

#### 8. Notification Service
**Responsibility**: User notifications

**Features**:
- Push notifications (FCM/APNs)
- Email notifications
- In-app notifications
- Price alerts
- Promotion notifications

**API Endpoints**:
```
POST   /notifications/subscribe
POST   /notifications/send
GET    /notifications/user/:userId
PUT    /notifications/:id/read
```

## Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  provider VARCHAR(50), -- 'google', 'apple', 'github', 'email'
  provider_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
```

#### Stores
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  chain_id UUID REFERENCES store_chains(id),
  address TEXT NOT NULL,
  city VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(POINT, 4326), -- PostGIS
  phone VARCHAR(50),
  operating_hours JSONB,
  amenities JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PostGIS spatial index for fast location queries
CREATE INDEX idx_stores_location ON stores USING GIST (location);
CREATE INDEX idx_stores_chain ON stores(chain_id);
```

#### Products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  brand VARCHAR(255),
  barcode VARCHAR(50) UNIQUE,
  image_url TEXT,
  unit VARCHAR(50), -- 'kg', 'liter', 'unit', etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_name ON products USING GIN (to_tsvector('spanish', name));
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
```

#### Prices
```sql
CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) NOT NULL,
  store_id UUID REFERENCES stores(id) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  stock_status VARCHAR(20), -- 'in_stock', 'low_stock', 'out_of_stock'
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  source VARCHAR(50), -- 'user', 'store', 'ocr', 'scraper'
  verified BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prices_product_store ON prices(product_id, store_id);
CREATE INDEX idx_prices_valid ON prices(valid_from, valid_until);
```

#### Promotions
```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  store_id UUID REFERENCES stores(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20), -- 'percentage', 'fixed', 'buy_x_get_y'
  discount_value DECIMAL(10, 2),
  original_price DECIMAL(10, 2),
  promotion_price DECIMAL(10, 2),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  conditions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_promotions_product ON promotions(product_id);
```

#### Shopping Lists
```sql
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES shopping_lists(id) NOT NULL,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255), -- in case product not in DB
  quantity DECIMAL(10, 2),
  unit VARCHAR(50),
  checked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shopping_list_items_list ON shopping_list_items(list_id);
```

## Security Architecture

### Authentication Flow

```
1. User clicks "Login with Google"
2. Redirect to Google OAuth
3. User authorizes
4. Google redirects with auth code
5. Backend exchanges code for tokens
6. Create/update user in database
7. Generate JWT token
8. Return JWT to client
9. Client stores JWT (secure storage)
10. Subsequent requests include JWT in header
```

### Authorization

**Role-Based Access Control (RBAC)**:
- **User**: Normal user operations
- **Admin**: Manage products, stores, prices
- **Moderator**: Review OCR submissions

### Data Security

1. **Encryption at Rest**: Database encryption
2. **Encryption in Transit**: HTTPS/TLS
3. **API Rate Limiting**: Prevent abuse
4. **Input Validation**: Prevent injection attacks
5. **CORS Configuration**: Restrict origins
6. **JWT Expiry**: Short-lived tokens (15 min) with refresh tokens

## Performance Optimization

### Caching Strategy

```typescript
// Redis caching layers
const cacheConfig = {
  // Hot data - 1 hour TTL
  searchResults: 3600,
  
  // Warm data - 6 hours TTL
  productDetails: 21600,
  storeDetails: 21600,
  
  // Cold data - 24 hours TTL
  promotions: 86400,
  categories: 86400
};
```

### Database Optimization

1. **Indexes**: Strategic indexes on frequent queries
2. **Materialized Views**: Pre-computed aggregations
3. **Connection Pooling**: Reuse database connections
4. **Query Optimization**: Use EXPLAIN ANALYZE
5. **Partitioning**: Partition prices table by date

### API Optimization

1. **Pagination**: Limit results per page
2. **Field Selection**: Return only requested fields
3. **Compression**: Gzip responses
4. **CDN**: Cache static assets
5. **Lazy Loading**: Load data as needed

## Scalability Strategy

### Horizontal Scaling

```
┌─────────────────────────────────────────────┐
│          Load Balancer (NGINX)              │
└─────────────────────────────────────────────┘
         │          │          │
    ┌────┴───┐  ┌──┴───┐  ┌──┴───┐
    │ API-1  │  │ API-2 │  │ API-3 │
    └────────┘  └───────┘  └───────┘
         │          │          │
    └────┴──────────┴──────────┴────┘
                   │
         ┌─────────┴─────────┐
         │    PostgreSQL     │
         │    (Primary)      │
         └───────────────────┘
```

### Future Microservices

When needed, extract services:
1. Route Optimization → Golang service
2. OCR Processing → Python/Golang service
3. Search → Elasticsearch cluster

## Monitoring & Observability

### Metrics to Track

1. **Application Metrics**:
   - Request rate (req/sec)
   - Response times (p50, p95, p99)
   - Error rates
   - Active users

2. **Business Metrics**:
   - Daily active users (DAU)
   - Searches per user
   - Receipt scans per day
   - Shopping lists created

3. **Infrastructure Metrics**:
   - CPU usage
   - Memory usage
   - Database connections
   - Cache hit ratio

### Logging Strategy

```typescript
// Structured logging
logger.info('Product searched', {
  userId: user.id,
  query: searchQuery,
  location: { lat, lon },
  resultsCount: results.length,
  responseTime: duration
});
```

## Disaster Recovery

1. **Database Backups**: Daily automated backups
2. **Point-in-Time Recovery**: WAL archiving
3. **Replica Databases**: Read replicas for failover
4. **Health Checks**: Automated monitoring and alerts
5. **Incident Response Plan**: Documented procedures

## Technology Decisions Summary

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Backend Framework | NestJS or Fastify | Structure + Performance |
| Frontend Web | React + TypeScript | Industry standard |
| Mobile | React Native | Code sharing |
| Database | PostgreSQL + PostGIS | Relational + GIS |
| Cache | Redis | Performance |
| File Storage | AWS S3 / GCS | Scalability |
| Authentication | Passport.js + JWT | Flexibility |
| OCR | Google Vision API | Accuracy |
| Maps | Google Maps API | Reliability |
| Monitoring | Datadog | Comprehensive |

---

**Version**: 1.0
**Last Updated**: 2026-02-08
**Next Review**: After Phase 3 implementation
