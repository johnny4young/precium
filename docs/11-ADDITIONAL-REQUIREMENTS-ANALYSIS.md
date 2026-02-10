# Additional Architecture Analysis & Enhancements

## Executive Summary

This document provides additional analysis and enhancements based on stakeholder feedback, covering API Gateway alternatives, authentication solutions (Keycloak), monetization strategies, search history/autocomplete, and advanced fuzzy search capabilities.

---

## 1. API Gateway Analysis: Simple vs Complex Solutions

### Current Proposal: Traditional API Gateway

```
Client → Load Balancer → API Gateway → Backend Services
```

### Question: Is API Gateway the Best Solution?

#### Option A: Traditional API Gateway (Kong, Traefik, NGINX Plus)

**Pros:**

- Centralized authentication/authorization
- Rate limiting and throttling
- Request/response transformation
- API versioning
- Monitoring and analytics
- Circuit breaking

**Cons:**

- Additional infrastructure complexity
- Single point of failure (unless redundant)
- Learning curve and maintenance
- Cost (if using commercial solutions)
- Potential performance bottleneck

#### Option B: Simpler Alternative - Direct Backend with Middleware ✅ RECOMMENDED

**For Precium's Scale:**

```
Client → Load Balancer → Golang Backend (with middleware) → Services
```

**Why This is Better for Precium:**

1. **Single Golang Application Initially**
   - All services in one codebase (monolith first)
   - Middleware handles cross-cutting concerns
   - Can extract to microservices later if needed

2. **Built-in Golang Middleware**

```go
// Fiber middleware stack
app := fiber.New()

// Logging
app.Use(logger.New())

// CORS
app.Use(cors.New(cors.Config{
    AllowOrigins: "https://precium.com",
    AllowMethods: "GET,POST,PUT,DELETE",
}))

// Rate limiting
app.Use(limiter.New(limiter.Config{
    Max: 100,
    Expiration: 1 * time.Minute,
}))

// Authentication
app.Use(authMiddleware())

// Request ID
app.Use(requestid.New())
```

3. **Simpler Architecture**
   - Fewer moving parts
   - Easier to debug
   - Lower operational overhead
   - Faster development

4. **When to Add API Gateway?**
   - When you have 5+ separate backend services
   - When you need advanced traffic management
   - When you need A/B testing capabilities
   - When you reach 100K+ requests/second

### Recommendation

**Start without API Gateway**, use Golang middleware:

- Use Fiber's built-in middleware for most needs
- Add Traefik as reverse proxy (lightweight, easy to configure)
- Migrate to full API Gateway (Kong) only if/when needed

**Phased Approach:**

```
Phase 1 (Iteration 1-3): Direct Backend
└── Traefik (reverse proxy) → Golang App (with middleware)

Phase 2 (Post-launch): If needed
└── Traefik → Kong API Gateway → Golang Services
```

---

## 2. Authentication: Keycloak vs Custom Solution

### Keycloak Open Source Analysis

#### What is Keycloak?

Open-source Identity and Access Management (IAM) solution by Red Hat/JBoss.

#### Pros ✅

**1. Feature-Rich Out of the Box**

- OAuth2 / OpenID Connect support
- SAML 2.0 support
- Social login (Google, Facebook, GitHub, Apple, etc.)
- Multi-factor authentication (MFA)
- Single Sign-On (SSO)
- User Federation (LDAP, Active Directory)
- Fine-grained authorization
- Admin console (UI for managing users)

**2. Security**

- Industry-standard security practices
- Regular security updates
- Battle-tested by enterprise users
- Compliance ready (GDPR, HIPAA)

**3. Scalability**

- Clustered deployment support
- Horizontal scaling
- Session replication

**4. Extensibility**

- Custom themes/branding
- Custom authentication flows
- REST APIs
- Event listeners

**5. Cost**

- Free and open source
- Large community support
- Extensive documentation

#### Cons ❌

**1. Complexity**

- Heavy Java application (requires JVM)
- Steep learning curve
- Complex configuration
- Over-engineered for simple use cases

**2. Infrastructure Requirements**

- Requires separate deployment
- Additional database (PostgreSQL recommended)
- High memory usage (~512MB-1GB minimum)
- Complex to set up and maintain

**3. Performance**

- Slower than lightweight solutions
- Additional network hop for every auth request
- Latency overhead

**4. Overkill for MVP**

- Most features won't be used initially
- Simple JWT auth is sufficient for start
- Adds unnecessary complexity early on

### Alternative: Custom Golang Authentication ✅ RECOMMENDED

**Implementation:**

```go
// Simple, performant, tailored to our needs
package auth

import (
    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/oauth2"
    "golang.org/x/oauth2/google"
)

// OAuth2 Configuration
var googleOAuthConfig = &oauth2.Config{
    ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
    ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
    RedirectURL:  "https://api.precium.com/auth/google/callback",
    Scopes:       []string{"email", "profile"},
    Endpoint:     google.Endpoint,
}

// JWT Token Generation
func GenerateToken(userID string) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": userID,
        "exp":     time.Now().Add(15 * time.Minute).Unix(),
    })
    return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

// Middleware
func AuthMiddleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        tokenString := c.Get("Authorization")
        // Validate JWT
        // Set user in context
        return c.Next()
    }
}
```

**Why This is Better Initially:**

1. **Simplicity**: 200 lines of code vs complex Keycloak setup
2. **Performance**: No additional network hop
3. **Control**: Full control over auth flow
4. **Lightweight**: No JVM, minimal resources
5. **Fast to Implement**: Can be done in Week 3 of Iteration 1

### Recommendation

**Phase 1 (Iteration 1-3): Custom Golang Auth**

- Implement OAuth2 for Google (Week 3)
- JWT tokens for sessions
- Refresh token mechanism
- Simple user table in PostgreSQL

**Phase 2 (Iteration 4+): Evaluate Keycloak**

- If we need MFA
- If we need SSO across multiple apps
- If we need enterprise features
- If we have dedicated DevOps resources

**Migration Path:**
Custom auth is designed to be OAuth2 compliant, so migrating to Keycloak later is straightforward if needed.

---

## 3. Monetization Strategy & Data Model

### Business Models Analysis

#### Option 1: Freemium Model ✅ RECOMMENDED

**Free Tier:**

- Basic product search
- Up to 5 shopping lists
- Standard route optimization
- Ads supported

**Premium Tier ($4.99/month or $49/year):**

- Unlimited shopping lists
- Priority route optimization
- Ad-free experience
- Price alerts
- Historical price charts
- Export shopping data
- Premium support

**Pro Tier ($9.99/month - for stores):**

- Store owner dashboard
- Promoted listings
- Analytics
- Customer insights
- Special offers management

#### Option 2: Advertising Model

**Revenue Streams:**

- Display ads (Google AdSense)
- Store promotions (featured stores)
- Sponsored products
- Affiliate links

#### Option 3: B2B Model

**Services for Stores:**

- API access for price integration
- Analytics dashboard
- Customer insights
- Competitive analysis

### Database Schema for Monetization

```sql
-- Subscription Plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- 'free', 'premium', 'pro'
    price_monthly DECIMAL(10, 2),
    price_yearly DECIMAL(10, 2),
    features JSONB NOT NULL,
    max_shopping_lists INT,
    ads_enabled BOOLEAN DEFAULT true,
    price_alerts_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'active', 'cancelled', 'expired', 'trial'
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    auto_renew BOOLEAN DEFAULT true,
    payment_method VARCHAR(50), -- 'stripe', 'apple_pay', 'google_pay'
    external_subscription_id VARCHAR(255), -- Stripe subscription ID
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    subscription_id UUID REFERENCES user_subscriptions(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    payment_method VARCHAR(50),
    external_payment_id VARCHAR(255), -- Stripe payment intent ID
    created_at TIMESTAMP DEFAULT NOW()
);

-- Advertisements
CREATE TABLE advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID REFERENCES users(id), -- Store owner
    type VARCHAR(20) NOT NULL, -- 'banner', 'sponsored_product', 'featured_store'
    title VARCHAR(255),
    description TEXT,
    image_url TEXT,
    target_url TEXT,
    product_id UUID REFERENCES products(id),
    store_id UUID REFERENCES stores(id),
    location_targeting GEOGRAPHY(POINT, 4326), -- Geographic targeting
    radius_meters INT, -- Targeting radius
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    budget_total DECIMAL(10, 2),
    cost_per_click DECIMAL(10, 4),
    cost_per_impression DECIMAL(10, 4),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'completed'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ad Impressions & Clicks
CREATE TABLE ad_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES advertisements(id) NOT NULL,
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(20) NOT NULL, -- 'impression', 'click', 'conversion'
    ip_address INET,
    user_agent TEXT,
    location GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ad_events_ad_id ON ad_events(ad_id);
CREATE INDEX idx_ad_events_created_at ON ad_events(created_at);

-- Store Promotions (for stores to create special offers)
CREATE TABLE store_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) NOT NULL,
    promotion_id UUID REFERENCES promotions(id) NOT NULL,
    visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'premium_only', 'featured'
    featured BOOLEAN DEFAULT false,
    featured_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints for Monetization

```
# Subscriptions
GET    /api/v1/subscriptions/plans
GET    /api/v1/subscriptions/user/:userId
POST   /api/v1/subscriptions/subscribe
POST   /api/v1/subscriptions/cancel
POST   /api/v1/subscriptions/upgrade

# Payments (Stripe integration)
POST   /api/v1/payments/create-intent
POST   /api/v1/payments/webhook (Stripe webhook)
GET    /api/v1/payments/history

# Advertisements (Store owners)
POST   /api/v1/ads/create
GET    /api/v1/ads/:id
PUT    /api/v1/ads/:id
DELETE /api/v1/ads/:id
GET    /api/v1/ads/analytics/:id

# Ad serving (for displaying ads)
GET    /api/v1/ads/display?location=lat,lon&type=banner
POST   /api/v1/ads/:id/impression
POST   /api/v1/ads/:id/click
```

### Implementation in Iteration Plan

**Iteration 3: Add Basic Monetization**

- Subscription plans table
- Free vs Premium tiers
- Stripe integration for payments

**Iteration 5: Advanced Monetization**

- Advertisement system
- Store promotions
- Analytics dashboard

---

## 4. User Search History & Autocomplete

### Feature Overview

Provide intelligent autocomplete based on:

1. User's own search history
2. Popular searches globally
3. Contextual suggestions (location-based)

### Database Schema

```sql
-- User Search History
CREATE TABLE user_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    search_query VARCHAR(255) NOT NULL,
    search_type VARCHAR(20), -- 'product', 'store', 'category'
    result_count INT,
    location GEOGRAPHY(POINT, 4326),
    selected_result_id UUID, -- Product/Store they clicked
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_search_history_user ON user_search_history(user_id);
CREATE INDEX idx_user_search_history_created ON user_search_history(created_at DESC);
CREATE INDEX idx_user_search_history_query ON user_search_history USING GIN (to_tsvector('spanish', search_query));

-- Popular Searches (aggregated)
CREATE TABLE popular_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_query VARCHAR(255) NOT NULL,
    search_count INT DEFAULT 0,
    last_searched TIMESTAMP,
    trending_score DECIMAL(10, 2), -- Algorithm-based trending score
    category_id UUID REFERENCES categories(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_popular_searches_score ON popular_searches(trending_score DESC);
CREATE INDEX idx_popular_searches_category ON popular_searches(category_id);
```

### API Endpoints

```
# Autocomplete
GET    /api/v1/search/autocomplete?q=huev&userId=:userId
       Response: {
           "suggestions": [
               {"text": "huevos", "type": "history", "frequency": 5},
               {"text": "huevos blancos", "type": "popular", "count": 1203},
               {"text": "huevos orgánicos", "type": "trending"}
           ]
       }

# Search with history tracking
POST   /api/v1/search/products
       Body: {
           "query": "huevos",
           "location": {"lat": 40.7, "lon": -74.0},
           "track": true
       }

# Get user search history
GET    /api/v1/search/history?userId=:userId&limit=20

# Clear search history
DELETE /api/v1/search/history/:userId
```

### Autocomplete Algorithm

```go
func GetAutocompleteS suggestions(query string, userID string) ([]Suggestion, error) {
    suggestions := []Suggestion{}

    // 1. User's recent searches (personalized)
    userHistory := getUserSearchHistory(userID, query, 3)
    suggestions = append(suggestions, userHistory...)

    // 2. Popular searches matching query
    popularSearches := getPopularSearches(query, 5)
    suggestions = append(suggestions, popularSearches...)

    // 3. Product names matching query (with fuzzy)
    productMatches := fuzzySearchProducts(query, 5)
    suggestions = append(suggestions, productMatches...)

    // 4. Remove duplicates and rank
    suggestions = deduplicateAndRank(suggestions)

    return suggestions[:10], nil // Top 10
}
```

### Implementation Timeline

**Iteration 2: Basic Search History**

- Track user searches
- Simple history endpoint
- Clear history function

**Iteration 3: Autocomplete**

- Autocomplete API
- User history-based suggestions
- Popular searches

**Iteration 4: Advanced**

- Trending algorithm
- Context-aware suggestions
- A/B testing for ranking

---

## 5. Advanced Fuzzy Search (First Iteration Priority)

### Requirement

Support typo-tolerant, similarity-based search for Spanish language:

- "huevos" → "huebos", "uevos", "huvos", "huevós"

### Technology Options

#### Option 1: PostgreSQL pg_trgm Extension ✅ RECOMMENDED

**Why:**

- Built into PostgreSQL
- Trigram-based similarity
- Fast with GIN indexes
- No external dependencies

**Setup:**

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add similarity index
CREATE INDEX products_name_trgm_idx ON products USING GIN (name gin_trgm_ops);

-- Add unaccent extension for Spanish accents
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Composite index for both
CREATE INDEX products_name_search_idx ON products USING GIN (
    unaccent(lower(name)) gin_trgm_ops
);
```

**Query Implementation:**

```sql
-- Fuzzy search with similarity threshold
SELECT
    p.*,
    similarity(unaccent(lower(p.name)), unaccent(lower($1))) as sim_score
FROM products p
WHERE
    unaccent(lower(p.name)) % unaccent(lower($1))  -- Similarity operator
    OR unaccent(lower(p.name)) LIKE '%' || unaccent(lower($1)) || '%'
ORDER BY sim_score DESC, p.name
LIMIT 20;

-- Example: searching "huebos" will match "huevos"
-- Parameters:
-- $1 = user input (e.g., "huebos")
-- Similarity threshold: 0.3 (configurable)
```

**Golang Implementation:**

```go
type FuzzySearchParams struct {
    Query            string
    SimilarityThreshold float32 // 0.3 means 30% similarity minimum
    Limit            int
}

func (r *ProductRepository) FuzzySearch(params FuzzySearchParams) ([]Product, error) {
    query := `
        SELECT
            id, name, description, price, category_id,
            similarity(unaccent(lower(name)), unaccent(lower($1))) as sim_score
        FROM products
        WHERE
            similarity(unaccent(lower(name)), unaccent(lower($1))) > $2
            OR unaccent(lower(name)) LIKE '%' || unaccent(lower($1)) || '%'
        ORDER BY sim_score DESC, name
        LIMIT $3
    `

    rows, err := r.db.Query(query, params.Query, params.SimilarityThreshold, params.Limit)
    // Process results...
}
```

**Features:**

- ✅ Handles typos: "huebos" → "huevos"
- ✅ Handles missing letters: "uevos" → "huevos"
- ✅ Handles accents: "huevós" → "huevos"
- ✅ Fast (with GIN index)
- ✅ Simple to implement

#### Option 2: Elasticsearch (Future Enhancement)

**When to Use:**

- After 100K+ products
- Need advanced features (faceted search, analytics)
- Multi-language support
- Complex ranking algorithms

**For MVP:** PostgreSQL pg_trgm is sufficient

### Implementation in Iteration 1

**Week 2: Database Setup**

```bash
# Add to migration
CREATE EXTENSION pg_trgm;
CREATE EXTENSION unaccent;
CREATE INDEX products_name_search_idx ON products USING GIN (unaccent(lower(name)) gin_trgm_ops);
```

**Week 4: Search Implementation**

```go
// Add fuzzy search to product service
// Test with various typos
// Tune similarity threshold (0.2 - 0.4 range)
```

### Search Quality Metrics

Monitor and optimize:

```sql
-- Track search effectiveness
CREATE TABLE search_quality_metrics (
    id UUID PRIMARY KEY,
    search_query VARCHAR(255),
    results_count INT,
    clicked_result_position INT, -- Which result did user click?
    user_id UUID,
    created_at TIMESTAMP
);

-- Analyze: Are users clicking first result or scrolling?
-- Optimize similarity threshold based on click data
```

---

## Summary of Recommendations

| Feature               | Recommendation                       | Timeline                          |
| --------------------- | ------------------------------------ | --------------------------------- |
| **API Gateway**       | Start without (use Fiber middleware) | Add later if needed               |
| **Authentication**    | Custom Golang OAuth2                 | Iteration 1, Week 3               |
| **Keycloak**          | Not needed for MVP                   | Evaluate post-launch              |
| **Monetization**      | Freemium model                       | Iteration 3 (basic), 5 (advanced) |
| **Search History**    | PostgreSQL + caching                 | Iteration 2                       |
| **Autocomplete**      | History + Popular + Fuzzy            | Iteration 3                       |
| **Fuzzy Search**      | PostgreSQL pg_trgm                   | Iteration 1, Week 2 ✅            |
| **Database for Auth** | SQLC (not Drizzle)                   | Golang-native                     |

---

## Updated Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                           │
│  Web (React+Vite) + Mobile (React Native)                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    ┌───────┴────────┐
                    │  Traefik Proxy │  (Simple reverse proxy)
                    └───────┬────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│              Golang Backend (Fiber + Middleware)             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Auth Middleware → Rate Limit → CORS → Logging              │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐    │
│  │Auth Service │  │Search Service│  │Product Service │    │
│  │(OAuth2+JWT) │  │(Fuzzy+Trgm)  │  │                │    │
│  └─────────────┘  └──────────────┘  └────────────────┘    │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐    │
│  │Store Svc    │  │Route Svc     │  │Subscription    │    │
│  │             │  │(Optimization)│  │Service         │    │
│  └─────────────┘  └──────────────┘  └────────────────┘    │
│                                                              │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────┴──────────────────────────────────┐
│                   PostgreSQL 17 + PostGIS                     │
│  Extensions: pg_trgm, unaccent, postgis                      │
│  SQLC for type-safe queries                                  │
└───────────────────────────────────────────────────────────────┘
```

---

**Document Version**: 1.0
**Last Updated**: 2026-02-08
**Status**: Additional Requirements Analysis Complete
**Next**: Integrate into main documentation and implementation roadmap
