# Supabase Deployment Guide

## Overview

This guide explains how to deploy the Precium PostgreSQL database to Supabase, a fully managed Postgres platform with built-in features like authentication, real-time subscriptions, storage, and edge functions. Supabase is an excellent choice for Precium because it provides PostgreSQL 17+ with PostGIS extension support, automatic backups, and a generous free tier.

## Table of Contents

1. [Why Supabase](#why-supabase)
2. [Prerequisites](#prerequisites)
3. [Project Setup](#project-setup)
4. [Database Migration](#database-migration)
5. [PostGIS Configuration](#postgis-configuration)
6. [Extensions Setup](#extensions-setup)
7. [Connection Configuration](#connection-configuration)
8. [Environment Variables](#environment-variables)
9. [Backup & Restore](#backup--restore)
10. [Performance Optimization](#performance-optimization)
11. [Security Best Practices](#security-best-practices)
12. [Monitoring & Maintenance](#monitoring--maintenance)
13. [Cost Estimation](#cost-estimation)
14. [Troubleshooting](#troubleshooting)

---

## Why Supabase

### Benefits for Precium

| Feature                | Benefit                                               |
| ---------------------- | ----------------------------------------------------- |
| **PostgreSQL 17+**     | Latest features, performance improvements             |
| **PostGIS Support**    | Built-in spatial queries for location-based features  |
| **pg_trgm Extension**  | Fuzzy search support (Spanish typos)                  |
| **Automatic Backups**  | Daily backups with point-in-time recovery             |
| **Connection Pooling** | Built-in PgBouncer for efficient connections          |
| **Real-time**          | Optional WebSocket support for live updates           |
| **Free Tier**          | 500MB database, 2GB bandwidth, unlimited API requests |
| **Global CDN**         | Edge functions for low-latency API responses          |
| **Dashboard**          | Web-based SQL editor and table viewer                 |
| **CLI Tools**          | Migration management and local development            |

### Comparison with Alternatives

| Feature                  | Supabase  | AWS RDS    | Google Cloud SQL | Neon       |
| ------------------------ | --------- | ---------- | ---------------- | ---------- |
| **PostgreSQL 17**        | ✅ Yes    | ✅ Yes     | ✅ Yes           | ✅ Yes     |
| **PostGIS**              | ✅ Yes    | ✅ Yes     | ✅ Yes           | ✅ Yes     |
| **Free Tier**            | ✅ 500MB  | ❌ No      | ❌ No            | ✅ 3GB     |
| **Auto-scaling**         | ⚠️ Manual | ✅ Yes     | ✅ Yes           | ✅ Yes     |
| **Setup Time**           | ~5 min    | ~15 min    | ~15 min          | ~5 min     |
| **Monthly Cost (Start)** | $0-25     | $30+       | $35+             | $0-19      |
| **Best For**             | MVP/Early | Production | Enterprise       | Serverless |

**Recommendation for Precium**: Start with Supabase free tier, upgrade to Pro ($25/mo) when database > 500MB or connections > 60.

---

## Prerequisites

### Required Tools

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase CLI**: For migrations and local development
3. **psql**: PostgreSQL client (optional, for manual queries)
4. **golang-migrate**: For managing database migrations

### Installation

```bash
# Install Supabase CLI (macOS)
brew install supabase/tap/supabase

# Install Supabase CLI (Linux/WSL)
curl -fsSL https://github.com/supabase/cli/releases/download/v1.142.2/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/

# Install Supabase CLI (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Verify installation
supabase --version

# Install golang-migrate
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Install psql (macOS)
brew install postgresql@17

# Install psql (Ubuntu/Debian)
sudo apt-get install postgresql-client-17
```

---

## Project Setup

### Step 1: Create Supabase Project

1. **Via Web Dashboard**:

   ```
   1. Go to https://app.supabase.com
   2. Click "New Project"
   3. Fill in details:
      - Name: precium-production (or precium-staging)
      - Database Password: Generate a strong password (save it securely!)
      - Region: Choose closest to your users (e.g., us-east-1, eu-central-1)
      - Pricing Plan: Free (start), Pro ($25/mo when needed)
   4. Click "Create new project"
   5. Wait 2-3 minutes for provisioning
   ```

2. **Note Important URLs**:
   ```
   Project URL: https://xxxxx.supabase.co
   API URL: https://xxxxx.supabase.co/rest/v1/
   GraphQL URL: https://xxxxx.supabase.co/graphql/v1
   Database Connection String: See "Project Settings > Database"
   ```

### Step 2: Get Connection Details

Navigate to **Project Settings > Database**:

```bash
# Connection String (use with SQLC or psql)
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Connection Pooler (recommended for applications)
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Direct Connection (for migrations)
Host: db.xxxxx.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [YOUR_PASSWORD]

# Pooled Connection (for app connections)
Host: aws-0-us-east-1.pooler.supabase.com
Port: 6543
Database: postgres
User: postgres.xxxxx
Password: [YOUR_PASSWORD]
```

### Step 3: Initialize Local Supabase Project

```bash
# In your project root
cd /path/to/precium

# Initialize Supabase
supabase init

# This creates:
# supabase/
# ├── config.toml      # Supabase configuration
# ├── seed.sql         # Seed data
# └── migrations/      # Database migrations
```

### Step 4: Link to Remote Project

```bash
# Link local project to Supabase
supabase link --project-ref xxxxx

# You'll be prompted for your database password
# This creates .env.local with connection details
```

---

## Database Migration

### Migration Strategy

Precium uses **golang-migrate** for database migrations. Here's how to integrate with Supabase:

### Step 1: Organize Migrations

```bash
# Create migrations directory
mkdir -p backend/migrations

# Migration files naming convention:
# YYYYMMDDHHMMSS_description.up.sql
# YYYYMMDDHHMMSS_description.down.sql

# Example structure:
backend/migrations/
├── 000001_initial_schema.up.sql
├── 000001_initial_schema.down.sql
├── 000002_add_postgis.up.sql
├── 000002_add_postgis.down.sql
├── 000003_add_fuzzy_search.up.sql
├── 000003_add_fuzzy_search.down.sql
├── 000004_add_monetization.up.sql
├── 000004_add_monetization.down.sql
└── 000005_add_scraping_tables.up.sql
```

### Step 2: Initial Schema Migration

```sql
-- backend/migrations/000001_initial_schema.up.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    phone_number VARCHAR(50),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    subscription_tier VARCHAR(50) DEFAULT 'free', -- free, premium, pro
    subscription_expires_at TIMESTAMPTZ,
    oauth_provider VARCHAR(50), -- google, apple, github
    oauth_provider_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_provider_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_subscription ON users(subscription_tier, subscription_expires_at);

-- Stores table (will add PostGIS columns in next migration)
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    chain VARCHAR(100),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    phone_number VARCHAR(50),
    website_url TEXT,
    opening_hours JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_stores_city ON stores(city) WHERE deleted_at IS NULL;
CREATE INDEX idx_stores_chain ON stores(chain) WHERE deleted_at IS NULL;

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    brand VARCHAR(200),
    barcode VARCHAR(100),
    image_url TEXT,
    unit VARCHAR(50), -- kg, lb, oz, each
    unit_quantity DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_products_name ON products(name) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category ON products(category, subcategory) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_barcode ON products(barcode) WHERE deleted_at IS NULL AND barcode IS NOT NULL;

-- Prices table
CREATE TABLE prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    unit VARCHAR(50),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    source VARCHAR(100), -- user_reported, scraped, ocr, api
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prices_product ON prices(product_id, effective_date DESC);
CREATE INDEX idx_prices_store ON prices(store_id, effective_date DESC);
CREATE INDEX idx_prices_effective ON prices(effective_date DESC);
CREATE INDEX idx_prices_source ON prices(source);

-- Shopping lists
CREATE TABLE shopping_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_shopping_lists_user ON shopping_lists(user_id) WHERE deleted_at IS NULL;

-- Shopping list items
CREATE TABLE shopping_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(500), -- Allow custom items not in products table
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit VARCHAR(50),
    notes TEXT,
    checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_list_items_list ON shopping_list_items(shopping_list_id);
CREATE INDEX idx_list_items_product ON shopping_list_items(product_id);

-- Promotions table
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id),
    product_id UUID REFERENCES products(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50), -- percentage, fixed_amount, bogo
    discount_value DECIMAL(10, 2),
    min_purchase DECIMAL(10, 2),
    max_discount DECIMAL(10, 2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    terms_conditions TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_promotions_store ON promotions(store_id, start_date, end_date);
CREATE INDEX idx_promotions_product ON promotions(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prices_updated_at BEFORE UPDATE ON prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON shopping_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Run Migrations

```bash
# Set Supabase database URL
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Run migrations
migrate -path backend/migrations -database "${DATABASE_URL}" up

# Check migration version
migrate -path backend/migrations -database "${DATABASE_URL}" version

# Rollback if needed
migrate -path backend/migrations -database "${DATABASE_URL}" down 1
```

---

## PostGIS Configuration

### Enable PostGIS Extension

```sql
-- backend/migrations/000002_add_postgis.up.sql

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Add location column to stores table
ALTER TABLE stores
ADD COLUMN location GEOGRAPHY(POINT, 4326);

-- Create spatial index for fast location queries
CREATE INDEX idx_stores_location ON stores USING GIST(location);

-- Add helper function to calculate distance
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN ST_Distance(
        ST_MakePoint(lon1, lat1)::geography,
        ST_MakePoint(lon2, lat2)::geography
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add function to find nearby stores
CREATE OR REPLACE FUNCTION find_nearby_stores(
    user_lat DOUBLE PRECISION,
    user_lon DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION DEFAULT 1000
) RETURNS TABLE(
    store_id UUID,
    store_name VARCHAR,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.name,
        ST_Distance(
            location,
            ST_MakePoint(user_lon, user_lat)::geography
        ) as distance
    FROM stores s
    WHERE s.location IS NOT NULL
        AND s.deleted_at IS NULL
        AND ST_DWithin(
            location,
            ST_MakePoint(user_lon, user_lat)::geography,
            radius_meters
        )
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql STABLE;
```

### Test PostGIS

```sql
-- Insert test store with location
INSERT INTO stores (name, address, city, state, location)
VALUES (
    'Walmart Supercenter',
    '123 Main St',
    'Los Angeles',
    'CA',
    ST_MakePoint(-118.2437, 34.0522)::geography
);

-- Find stores within 1km of user location
SELECT * FROM find_nearby_stores(34.0522, -118.2437, 1000);
```

---

## Extensions Setup

### Enable Required Extensions

```sql
-- backend/migrations/000003_add_fuzzy_search.up.sql

-- Enable fuzzy search extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create GIN index for fuzzy search on product names
CREATE INDEX idx_products_name_trgm ON products
USING GIN (name gin_trgm_ops)
WHERE deleted_at IS NULL;

-- Create GIN index for fuzzy search on product brands
CREATE INDEX idx_products_brand_trgm ON products
USING GIN (brand gin_trgm_ops)
WHERE deleted_at IS NULL AND brand IS NOT NULL;

-- Create function for fuzzy product search
CREATE OR REPLACE FUNCTION fuzzy_search_products(
    search_term VARCHAR,
    similarity_threshold REAL DEFAULT 0.3,
    max_results INT DEFAULT 20
) RETURNS TABLE(
    product_id UUID,
    product_name VARCHAR,
    similarity_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        SIMILARITY(unaccent(p.name), unaccent(search_term)) as score
    FROM products p
    WHERE p.deleted_at IS NULL
        AND (
            unaccent(p.name) % unaccent(search_term)
            OR unaccent(p.name) ILIKE '%' || unaccent(search_term) || '%'
        )
    ORDER BY score DESC, p.name
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- Test fuzzy search
-- SELECT * FROM fuzzy_search_products('huebos'); -- Should return "huevos"
-- SELECT * FROM fuzzy_search_products('uevos');  -- Should return "huevos"
-- SELECT * FROM fuzzy_search_products('huevós'); -- Should return "huevos"
```

### Verify Extensions

```bash
# Connect to Supabase database
psql "${DATABASE_URL}"

# List installed extensions
\dx

# Expected output:
#   postgis         | 3.4.0   | public     | PostGIS geometry and geography spatial types
#   postgis_topology| 3.4.0   | topology   | PostGIS topology spatial types
#   pg_trgm         | 1.6     | public     | text similarity measurement
#   unaccent        | 1.1     | public     | text search dictionary for accent removal
```

---

## Connection Configuration

### Golang Connection Pool

```go
// internal/database/supabase.go
package database

import (
    "context"
    "fmt"
    "time"

    "github.com/jackc/pgx/v5/pgxpool"
    "github.com/rs/zerolog/log"
)

// SupabaseConfig holds Supabase connection configuration
type SupabaseConfig struct {
    Host            string
    Port            int
    Database        string
    User            string
    Password        string
    PoolMaxConns    int32
    PoolMinConns    int32
    PoolMaxIdleTime time.Duration
    ConnMaxLifetime time.Duration
}

// NewSupabasePool creates a new PostgreSQL connection pool for Supabase
func NewSupabasePool(cfg *SupabaseConfig) (*pgxpool.Pool, error) {
    // Use connection pooler URL for better performance
    connString := fmt.Sprintf(
        "postgresql://%s:%s@%s:%d/%s?sslmode=require&pool_max_conns=%d",
        cfg.User,
        cfg.Password,
        cfg.Host, // Use pooler: aws-0-us-east-1.pooler.supabase.com
        cfg.Port, // Port 6543 for pooler, 5432 for direct
        cfg.Database,
        cfg.PoolMaxConns,
    )

    poolConfig, err := pgxpool.ParseConfig(connString)
    if err != nil {
        return nil, fmt.Errorf("unable to parse config: %w", err)
    }

    // Configure connection pool
    poolConfig.MaxConns = cfg.PoolMaxConns
    poolConfig.MinConns = cfg.PoolMinConns
    poolConfig.MaxConnIdleTime = cfg.PoolMaxIdleTime
    poolConfig.MaxConnLifetime = cfg.ConnMaxLifetime
    poolConfig.HealthCheckPeriod = 1 * time.Minute

    // Create pool
    pool, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
    if err != nil {
        return nil, fmt.Errorf("unable to create connection pool: %w", err)
    }

    // Test connection
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := pool.Ping(ctx); err != nil {
        return nil, fmt.Errorf("unable to ping database: %w", err)
    }

    log.Info().
        Str("host", cfg.Host).
        Int("port", cfg.Port).
        Int32("max_conns", cfg.PoolMaxConns).
        Msg("Successfully connected to Supabase")

    return pool, nil
}
```

---

## Environment Variables

### .env Configuration

```bash
# .env.production
# Supabase Configuration

# Project Details
SUPABASE_PROJECT_ID=xxxxx
SUPABASE_PROJECT_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Connection (Direct - for migrations)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Database Connection (Pooled - for application)
DATABASE_POOL_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Database Pool Configuration
DB_POOL_MAX_CONNS=20
DB_POOL_MIN_CONNS=5
DB_POOL_MAX_IDLE_TIME=10m
DB_CONN_MAX_LIFETIME=1h

# Supabase Services (optional, if using Supabase auth/storage)
SUPABASE_AUTH_URL=https://xxxxx.supabase.co/auth/v1
SUPABASE_STORAGE_URL=https://xxxxx.supabase.co/storage/v1
```

### Load Environment Variables

```go
// cmd/api/main.go
package main

import (
    "os"
    "strconv"
    "time"

    "github.com/joho/godotenv"
    "precium/internal/database"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Warn().Msg("No .env file found, using environment variables")
    }

    // Parse configuration
    cfg := &database.SupabaseConfig{
        Host:            os.Getenv("DB_HOST"),
        Port:            parseInt(os.Getenv("DB_PORT"), 6543),
        Database:        os.Getenv("DB_DATABASE"),
        User:            os.Getenv("DB_USER"),
        Password:        os.Getenv("DB_PASSWORD"),
        PoolMaxConns:    int32(parseInt(os.Getenv("DB_POOL_MAX_CONNS"), 20)),
        PoolMinConns:    int32(parseInt(os.Getenv("DB_POOL_MIN_CONNS"), 5)),
        PoolMaxIdleTime: parseDuration(os.Getenv("DB_POOL_MAX_IDLE_TIME"), 10*time.Minute),
        ConnMaxLifetime: parseDuration(os.Getenv("DB_CONN_MAX_LIFETIME"), 1*time.Hour),
    }

    // Create database pool
    pool, err := database.NewSupabasePool(cfg)
    if err != nil {
        log.Fatal().Err(err).Msg("Failed to connect to database")
    }
    defer pool.Close()

    // ... rest of application setup
}
```

---

## Backup & Restore

### Automatic Backups

Supabase provides automatic daily backups:

- **Free Tier**: 7 days of backup retention
- **Pro Tier**: 30 days of backup retention + PITR (Point-in-Time Recovery)

### Manual Backup

```bash
# Backup entire database
pg_dump "${DATABASE_URL}" > precium_backup_$(date +%Y%m%d).sql

# Backup specific tables
pg_dump "${DATABASE_URL}" -t users -t stores -t products > precium_core_$(date +%Y%m%d).sql

# Backup with compression
pg_dump "${DATABASE_URL}" | gzip > precium_backup_$(date +%Y%m%d).sql.gz
```

### Restore from Backup

```bash
# Restore full database
psql "${DATABASE_URL}" < precium_backup_20260209.sql

# Restore compressed backup
gunzip -c precium_backup_20260209.sql.gz | psql "${DATABASE_URL}"

# Restore via Supabase Dashboard
# 1. Go to Project Settings > Database > Backups
# 2. Select backup date
# 3. Click "Restore"
```

---

## Performance Optimization

### Connection Pooling

Always use the **connection pooler** URL for application connections:

```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Benefits:

- Reduces connection overhead
- Handles connection spikes
- Better resource utilization

### Query Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_prices_latest ON prices(product_id, store_id, effective_date DESC);
CREATE INDEX idx_stores_chain_location ON stores(chain, location) WHERE deleted_at IS NULL;

-- Analyze tables for query planner
ANALYZE users;
ANALYZE stores;
ANALYZE products;
ANALYZE prices;

-- Check slow queries (Pro plan)
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

### SQLC Configuration for Supabase

```yaml
# sqlc.yaml
version: '2'
sql:
  - engine: 'postgresql'
    queries: 'internal/database/queries'
    schema: 'internal/database/schema'
    gen:
      go:
        package: 'db'
        out: 'internal/database/sqlc'
        sql_package: 'pgx/v5'
        emit_json_tags: true
        emit_db_tags: true
        emit_interface: true
        emit_empty_slices: true
```

---

## Security Best Practices

### 1. Use Environment Variables

Never commit database credentials to version control:

```bash
# .gitignore
.env
.env.local
.env.production
*.pem
*.key
```

### 2. Enable Row Level Security (RLS)

```sql
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own shopping lists" ON shopping_lists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own shopping lists" ON shopping_lists
    FOR ALL USING (auth.uid() = user_id);
```

### 3. Use Service Role Key Carefully

- **Anon Key**: For client-side operations (respects RLS)
- **Service Role Key**: For server-side operations (bypasses RLS) - keep secure!

### 4. Enable SSL

Always use `sslmode=require` in connection strings (Supabase enforces this).

### 5. IP Allowlist (Pro Plan)

Restrict database access to specific IP addresses in Project Settings.

---

## Monitoring & Maintenance

### Supabase Dashboard

Monitor your database at: `https://app.supabase.com/project/xxxxx`

- **Database**: View tables, run SQL queries
- **Table Editor**: Browse and edit data
- **SQL Editor**: Execute SQL commands
- **Database Health**: CPU, memory, connections
- **Logs**: Query logs, error logs

### Key Metrics to Monitor

```sql
-- Current connections
SELECT count(*) FROM pg_stat_activity;

-- Database size
SELECT pg_size_pretty(pg_database_size('postgres'));

-- Table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Slow queries (requires pg_stat_statements)
SELECT
    query,
    calls,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Alerts

Set up alerts in Supabase Dashboard:

- Database size > 80% of quota
- Connection count > 80% of limit
- High query latency

---

## Cost Estimation

### Supabase Pricing Tiers

| Feature                  | Free      | Pro            | Team           | Enterprise |
| ------------------------ | --------- | -------------- | -------------- | ---------- |
| **Price**                | $0/mo     | $25/mo         | $599/mo        | Custom     |
| **Database Size**        | 500 MB    | 8 GB           | Unlimited      | Unlimited  |
| **Bandwidth**            | 2 GB      | 50 GB          | 250 GB         | Custom     |
| **Monthly Active Users** | Unlimited | Unlimited      | Unlimited      | Unlimited  |
| **Backups**              | 7 days    | 30 days + PITR | 90 days + PITR | Custom     |
| **Support**              | Community | Email          | Priority       | Dedicated  |

### Precium Cost Projection

| Phase                       | Database Size | Monthly Cost | Tier          |
| --------------------------- | ------------- | ------------ | ------------- |
| **MVP (0-1K users)**        | <500 MB       | $0           | Free          |
| **Growth (1-10K users)**    | 2-5 GB        | $25          | Pro           |
| **Scale (10-50K users)**    | 10-20 GB      | $25-50       | Pro + Storage |
| **Enterprise (50K+ users)** | 50+ GB        | Custom       | Enterprise    |

**Recommendation**: Start with Free tier, upgrade to Pro when:

- Database size > 400 MB (80% of free tier)
- Need Point-in-Time Recovery
- Need priority support
- Connections > 60 concurrent

---

## Troubleshooting

### Common Issues

#### 1. Connection Timeout

```
Error: connection timeout
```

**Solution**:

- Use connection pooler URL (port 6543)
- Increase connection timeout in your app
- Check firewall/network settings

#### 2. Too Many Connections

```
Error: sorry, too many clients already
```

**Solution**:

- Use connection pooler (port 6543 instead of 5432)
- Reduce `DB_POOL_MAX_CONNS`
- Upgrade to Pro tier (more connections)

#### 3. PostGIS Extension Not Found

```
Error: type "geography" does not exist
```

**Solution**:

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify
SELECT PostGIS_Version();
```

#### 4. Migration Fails

```
Error: relation "products" already exists
```

**Solution**:

```bash
# Check migration version
migrate -path backend/migrations -database "${DATABASE_URL}" version

# Force version (if needed)
migrate -path backend/migrations -database "${DATABASE_URL}" force 1

# Re-run migrations
migrate -path backend/migrations -database "${DATABASE_URL}" up
```

---

## Summary

### Deployment Checklist

- [ ] Create Supabase project
- [ ] Save connection credentials securely
- [ ] Install Supabase CLI
- [ ] Link local project to Supabase
- [ ] Run database migrations
- [ ] Enable PostGIS extension
- [ ] Enable pg_trgm and unaccent extensions
- [ ] Configure connection pooling in application
- [ ] Set up environment variables
- [ ] Test database connection
- [ ] Configure automatic backups
- [ ] Enable monitoring and alerts
- [ ] Document connection details for team

### Next Steps

1. **Test locally**: Use Supabase local development
2. **Run migrations**: Apply all schema migrations
3. **Seed data**: Add initial test data
4. **Configure SQLC**: Generate type-safe Go code
5. **Deploy backend**: Connect Golang backend to Supabase
6. **Monitor**: Set up alerts and monitoring
7. **Scale**: Upgrade to Pro when needed

---

## Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostGIS Docs**: https://postgis.net/docs/
- **pg_trgm Docs**: https://www.postgresql.org/docs/current/pgtrgm.html
- **golang-migrate**: https://github.com/golang-migrate/migrate
- **SQLC**: https://sqlc.dev/

---

## Support

- **Supabase Discord**: https://discord.supabase.com
- **GitHub Issues**: https://github.com/supabase/supabase/issues
- **Stack Overflow**: Tag with `supabase`

---

This guide provides everything needed to deploy Precium's PostgreSQL database to Supabase with optimal configuration for performance, scalability, and cost-effectiveness.
