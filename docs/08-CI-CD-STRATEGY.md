# CI/CD Strategy

## Overview

This document outlines the Continuous Integration and Continuous Deployment strategy for the Precium application.

## CI/CD Goals

1. **Automated Testing**: Run tests on every commit
2. **Fast Feedback**: Results within 5-10 minutes
3. **Quality Gates**: Enforce code quality standards
4. **Automated Deployments**: Push to production with confidence
5. **Zero Downtime**: Rolling deployments without service interruption
6. **Rollback Capability**: Quick recovery from failures

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Developer Workflow                     │
└─────────────────────────────────────────────────────────┘
                           │
                           ├── git push
                           │
┌─────────────────────────────────────────────────────────┐
│                   GitHub Actions                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐   │
│  │  Stage 1: Validation                            │   │
│  │  - Checkout code                                │   │
│  │  - Setup Node.js                                │   │
│  │  - Install dependencies (cached)                │   │
│  │  - Lint (ESLint + Prettier)                     │   │
│  │  - Type check (TypeScript)                      │   │
│  └────────────────────────────────────────────────┘   │
│                           │                             │
│  ┌────────────────────────────────────────────────┐   │
│  │  Stage 2: Testing                               │   │
│  │  - Unit tests (Jest)                            │   │
│  │  - Integration tests                            │   │
│  │  - E2E tests (Cypress/Playwright)               │   │
│  │  - Coverage report                              │   │
│  └────────────────────────────────────────────────┘   │
│                           │                             │
│  ┌────────────────────────────────────────────────┐   │
│  │  Stage 3: Build                                 │   │
│  │  - Build backend                                │   │
│  │  - Build web app                                │   │
│  │  - Build mobile apps (if applicable)            │   │
│  │  - Generate documentation                       │   │
│  └────────────────────────────────────────────────┘   │
│                           │                             │
│  ┌────────────────────────────────────────────────┐   │
│  │  Stage 4: Security & Quality                    │   │
│  │  - Security scan (Snyk/Trivy)                   │   │
│  │  - Dependency check                             │   │
│  │  - Code quality (SonarQube)                     │   │
│  │  - Docker image scan                            │   │
│  └────────────────────────────────────────────────┘   │
│                           │                             │
│  ┌────────────────────────────────────────────────┐   │
│  │  Stage 5: Deploy                                │   │
│  │  - Build Docker images                          │   │
│  │  - Push to registry                             │   │
│  │  - Deploy to environment                        │   │
│  │  - Run smoke tests                              │   │
│  │  - Notify team                                  │   │
│  └────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Environments

### 1. Development (Local)
- **Trigger**: Manual (docker-compose up)
- **Purpose**: Local development and testing
- **Infrastructure**: Docker Compose
- **Database**: Local PostgreSQL
- **Domain**: localhost:3000 (web), localhost:3001 (api)

### 2. Staging
- **Trigger**: Push to `develop` branch
- **Purpose**: Integration testing and QA
- **Infrastructure**: Cloud (AWS/GCP/Azure)
- **Database**: Staging PostgreSQL instance
- **Domain**: staging.precium.com
- **Features**: Production-like environment

### 3. Production
- **Trigger**: Push to `main` branch (after approval)
- **Purpose**: Live user-facing application
- **Infrastructure**: Cloud with auto-scaling
- **Database**: Production PostgreSQL (managed)
- **Domain**: precium.com
- **Features**: High availability, monitoring, backups

## GitHub Actions Workflows

### Main CI Workflow

**File**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Job 1: Validation
  validate:
    name: Validate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'

      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.22'
          cache: true
          cache-dependency-path: apps/backend/go.sum

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: |
          npm run lint
          cd apps/backend && golangci-lint run

      - name: Type check
        run: npm run type-check

      - name: Check formatting
        run: npm run format:check

  # Job 2: Unit Tests
  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'

      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.22'
          cache: true

      - name: Install frontend dependencies
        run: npm ci

      - name: Run frontend unit tests
        run: npm run test:unit -- --coverage

      - name: Run backend unit tests
        run: |
          cd apps/backend
          go test -v -coverprofile=coverage.out ./...

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json,./apps/backend/coverage.out
          flags: unittests

  # Job 3: Integration Tests
  test-integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: validate
    services:
      postgres:
        image: postgis/postgis:15-3.3
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: precium_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'

      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.22'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: |
          cd apps/backend
          migrate -path db/migrations -database "$DATABASE_URL" up
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/precium_test

      - name: Run integration tests
        run: |
          cd apps/backend
          go test -v ./internal/... -tags=integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/precium_test
          REDIS_URL: redis://localhost:6379

  # Job 4: E2E Tests
  test-e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  # Job 5: Build
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [test-unit, test-integration, test-e2e]
    strategy:
      matrix:
        app: [backend, web]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        if: matrix.app == 'web'
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'

      - name: Setup Go
        if: matrix.app == 'backend'
        uses: actions/setup-go@v4
        with:
          go-version: '1.22'

      - name: Install dependencies
        if: matrix.app == 'web'
        run: npm ci

      - name: Build backend
        if: matrix.app == 'backend'
        run: |
          cd apps/backend
          go build -o bin/server cmd/server/main.go

      - name: Build web
        if: matrix.app == 'web'
        run: npm run build --workspace=apps/web

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.app }}-build
          path: |
            apps/backend/bin/server
            apps/web/dist

  # Job 6: Security Scan
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

### Backend Deployment Workflow

**File**: `.github/workflows/deploy-backend.yml`

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'apps/backend/**'
      - 'packages/**'
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: precium-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
            -f apps/backend/Dockerfile .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
            $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster precium-production \
            --service backend \
            --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster precium-production \
            --services backend

      - name: Run smoke tests
        run: |
          curl -f https://api.precium.com/health || exit 1

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        if: always()
        with:
          status: ${{ job.status }}
          text: 'Backend deployment to production: ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Web Deployment Workflow

**File**: `.github/workflows/deploy-web.yml`

```yaml
name: Deploy Web

on:
  push:
    branches: [main]
    paths:
      - 'apps/web/**'
      - 'packages/**'
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://precium.com
            https://precium.com/search
          uploadArtifacts: true
```

### Mobile Build Workflow

**File**: `.github/workflows/build-mobile.yml`

```yaml
name: Build Mobile

on:
  push:
    branches: [main, develop]
    paths:
      - 'apps/mobile/**'
      - 'packages/**'

jobs:
  build-android:
    name: Build Android
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Build Android APK
        working-directory: apps/mobile
        run: |
          cd android
          ./gradlew assembleRelease

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: android-apk
          path: apps/mobile/android/app/build/outputs/apk/release/

  build-ios:
    name: Build iOS
    runs-on: macos-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install CocoaPods
        run: |
          cd apps/mobile/ios
          pod install

      - name: Build iOS
        working-directory: apps/mobile/ios
        run: |
          xcodebuild -workspace Precium.xcworkspace \
            -scheme Precium \
            -configuration Release \
            -archivePath Precium.xcarchive \
            archive
```

## Deployment Strategies

### Backend Deployment

**Strategy**: Blue-Green Deployment with AWS ECS

```
1. Build new Docker image
2. Push to ECR
3. Create new ECS task definition
4. Update ECS service (rolling update)
5. Wait for new tasks to be healthy
6. Drain old tasks
7. Complete deployment
```

**Rollback**: 
```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster precium-production \
  --service backend \
  --task-definition precium-backend:previous
```

### Web Deployment

**Strategy**: Serverless Edge with Vercel

```
1. Build optimized production bundle
2. Deploy to Vercel
3. Automatic CDN distribution
4. Instant rollback capability
```

### Mobile Deployment

**Strategy**: Staged Rollout

```
1. Build signed APK/IPA
2. Upload to Google Play Console / App Store Connect
3. Release to internal testing (1% users)
4. Monitor for 24 hours
5. Gradual rollout: 10% → 25% → 50% → 100%
6. Rollback if crash rate > 1%
```

## Database Migrations

### Strategy

```typescript
// Migration workflow
1. Write migration file
2. Test migration locally
3. Run migration on staging
4. Verify staging data
5. Run migration on production (during low-traffic window)
6. Monitor for errors
7. Keep rollback migration ready
```

### Migration Example

```sql
-- 20260208_add_promotions_table.up.sql
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    store_id UUID REFERENCES stores(id),
    title VARCHAR(255) NOT NULL,
    discount_value DECIMAL(10, 2),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promotions_dates 
    ON promotions(start_date, end_date);

-- 20260208_add_promotions_table.down.sql
DROP INDEX idx_promotions_dates;
DROP TABLE promotions;
```

### Migration Deployment

```yaml
# .github/workflows/migrate.yml
name: Run Migrations

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to migrate'
        required: true
        type: choice
        options:
          - staging
          - production

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'

      - name: Install dependencies
        run: npm ci

      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.22'

      - name: Install golang-migrate
        run: |
          curl -L https://github.com/golang-migrate/migrate/releases/download/v4.16.2/migrate.linux-amd64.tar.gz | tar xvz
          sudo mv migrate /usr/local/bin/

      - name: Run migrations
        run: |
          cd apps/backend
          migrate -path db/migrations -database $DATABASE_URL up
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Verify migrations
        run: |
          cd apps/backend
          migrate -path db/migrations -database $DATABASE_URL version
```

## Monitoring & Alerts

### Health Checks

```go
// apps/backend/internal/health/handler.go
package health

import (
    "context"
    "github.com/gofiber/fiber/v2"
)

type Handler struct {
    db    *sql.DB
    redis *redis.Client
}

func (h *Handler) Check(c *fiber.Ctx) error {
    ctx := context.Background()
    
    // Check database
    if err := h.db.PingContext(ctx); err != nil {
        return c.Status(503).JSON(fiber.Map{
            "status": "unhealthy",
            "database": "down",
        })
    }
    
    // Check Redis
    if err := h.redis.Ping(ctx).Err(); err != nil {
        return c.Status(503).JSON(fiber.Map{
            "status": "unhealthy",
            "redis": "down",
        })
    }
    
    return c.JSON(fiber.Map{
        "status": "healthy",
        "database": "up",
        "redis": "up",
    })
}
```

### Alerts Configuration

```yaml
# alerts.yml
alerts:
  - name: High Error Rate
    condition: error_rate > 5%
    duration: 5m
    channels: [slack, pagerduty]

  - name: Slow Response Time
    condition: p95_response_time > 1s
    duration: 10m
    channels: [slack]

  - name: Database Connection Issues
    condition: db_connection_errors > 0
    duration: 1m
    channels: [slack, pagerduty]

  - name: High CPU Usage
    condition: cpu_usage > 80%
    duration: 15m
    channels: [slack]

  - name: Deployment Failed
    condition: deployment_status == 'failed'
    channels: [slack, pagerduty]
```

## Quality Gates

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ],
    "*.{json,md,yml}": [
      "prettier --write"
    ]
  }
}
```

### Branch Protection Rules

```
main branch:
- Require pull request reviews (2 approvals)
- Require status checks to pass
- Require branches to be up to date
- Require linear history
- No force pushes
- No deletions

develop branch:
- Require pull request reviews (1 approval)
- Require status checks to pass
```

### Code Coverage Requirements

```
Minimum coverage: 80%
Critical paths: 100%
New code: 90%
```

## Performance Budgets

```json
{
  "budgets": [
    {
      "path": "/*",
      "timings": [
        {
          "metric": "first-contentful-paint",
          "budget": 2000
        },
        {
          "metric": "largest-contentful-paint",
          "budget": 2500
        },
        {
          "metric": "time-to-interactive",
          "budget": 3000
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 300
        },
        {
          "resourceType": "stylesheet",
          "budget": 50
        }
      ]
    }
  ]
}
```

## Disaster Recovery

### Backup Strategy

```yaml
Databases:
  - Automated daily backups (retained 30 days)
  - Point-in-time recovery (7 days)
  - Cross-region replication
  - Monthly backup testing

Application:
  - Infrastructure as Code (Terraform)
  - Container images in registry
  - Configuration in version control
  - Secrets in secure vault

Recovery Time Objective (RTO): 4 hours
Recovery Point Objective (RPO): 1 hour
```

### Incident Response

```
1. Alert triggered
2. On-call engineer notified
3. Assess severity
4. Communicate to stakeholders
5. Implement fix or rollback
6. Verify resolution
7. Post-mortem review
8. Update runbooks
```

---

**Version**: 1.0
**Last Updated**: 2026-02-08
**Review Frequency**: Quarterly
