# Development Guidelines

## Getting Started

### Prerequisites

- Node.js 20 LTS
- npm 10+
- Docker & Docker Compose
- Git
- PostgreSQL 15+ (via Docker)
- Redis 7+ (via Docker)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/johnny4young/precium.git
cd precium

# Install dependencies
npm install

# Copy environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env

# Start infrastructure
docker-compose up -d

# Run database migrations
npm run migrate

# Seed database
npm run seed

# Start development servers
npm run dev
```

## Development Workflow

### 1. Creating a New Feature

```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Make your changes
# ... code ...

# Run tests
npm run test

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### 2. Working in the Monorepo

```bash
# Run command in specific workspace
npm run dev --workspace=apps/backend
npm run build --workspace=apps/web
npm run test --workspace=packages/shared-types

# Run command in all workspaces
npm run test

# Add dependency to specific workspace
npm install axios --workspace=apps/backend
npm install -D @types/node --workspace=apps/backend
```

### 3. Database Management

```bash
# Create new migration
npm run migration:create --name=add-new-table

# Run migrations
npm run migrate

# Rollback migration
npm run migrate:rollback

# Seed database
npm run seed

# Reset database (drop, create, migrate, seed)
npm run db:reset
```

## Code Style Guide

### TypeScript

```typescript
// ✅ GOOD
interface User {
  id: string;
  name: string;
  email: string;
}

const getUserById = async (id: string): Promise<User | null> => {
  const user = await userRepository.findOne({ where: { id } });
  return user;
};

// ❌ BAD
const getUserById = async (id: any) => {
  return await userRepository.findOne({ where: { id } });
};
```

### React Components

```typescript
// ✅ GOOD
interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
}) => {
  return (
    <Card onClick={() => onSelect?.(product)}>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </Card>
  );
};

// ❌ BAD
export const ProductCard = (props: any) => {
  return (
    <div onClick={() => props.onSelect(props.product)}>
      <h3>{props.product.name}</h3>
    </div>
  );
};
```

### Naming Conventions

```typescript
// Variables and functions: camelCase
const userCount = 10;
const calculateTotal = () => {};

// Classes and interfaces: PascalCase
class UserService {}
interface UserProfile {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.precium.com';

// Booleans: prefix with is/has/should/can
const isLoading = true;
const hasPermission = false;
const shouldRefresh = true;
const canEdit = false;

// Private members: prefix with underscore
class Example {
  private _privateValue: string;
  public publicValue: string;
}

// File names
// - Components: PascalCase (ProductCard.tsx)
// - Services: camelCase (user.service.ts)
// - Utilities: camelCase (format.ts)
// - Types: camelCase (user.types.ts)
```

## Testing Guidelines

### Unit Tests

```typescript
// ProductService.spec.ts
describe('ProductService', () => {
  let service: ProductService;
  let repository: MockType<Repository<Product>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get(ProductService);
    repository = module.get(getRepositoryToken(Product));
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' },
      ];

      repository.find.mockReturnValue(mockProducts);

      const result = await service.findAll();
      
      expect(result).toEqual(mockProducts);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should handle empty results', async () => {
      repository.find.mockReturnValue([]);

      const result = await service.findAll();
      
      expect(result).toEqual([]);
    });
  });
});
```

### Integration Tests

```typescript
// products.e2e-spec.ts
describe('Products (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /products', () => {
    it('should return products list', () => {
      return request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Product Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('should display search results', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'milk');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
    
    const productCount = await page.locator('[data-testid="product-card"]').count();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should filter by location', async ({ page }) => {
    // Mock geolocation
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 40.7128, longitude: -74.0060 });

    await page.fill('[data-testid="search-input"]', 'bread');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="distance-label"]').first()).toContainText('km');
  });
});
```

### Test Coverage Requirements

- **Unit Tests**: Minimum 80% coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Main user journeys covered

```bash
# Run tests with coverage
npm run test:cov

# View coverage report
open coverage/lcov-report/index.html
```

## Git Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(search): add location-based product search"

# Bug fix
git commit -m "fix(auth): resolve token refresh issue"

# Documentation
git commit -m "docs(api): update authentication endpoints"

# With body
git commit -m "feat(routes): implement route optimization

- Add nearest neighbor algorithm
- Add 2-opt optimization
- Add price-based optimization mode

Closes #123"
```

## Pull Request Guidelines

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No new warnings

## Testing
Describe testing done

## Screenshots (if applicable)
Add screenshots for UI changes
```

### Review Process

1. **Create PR** with descriptive title and complete template
2. **Automated Checks**: Wait for CI to pass
3. **Request Reviews**: Assign 1-2 reviewers
4. **Address Feedback**: Make requested changes
5. **Approval**: Get required approvals
6. **Merge**: Squash and merge to main

## Code Review Checklist

### For Reviewers

- [ ] Code follows project style guide
- [ ] No obvious bugs or issues
- [ ] Logic is clear and understandable
- [ ] Tests are adequate
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Documentation updated
- [ ] No unnecessary dependencies added

### For Authors

- [ ] Self-review completed
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Migration scripts provided (if needed)
- [ ] Performance tested
- [ ] Security reviewed

## Performance Guidelines

### Backend

```typescript
// ✅ GOOD - Use select to fetch only needed fields
const products = await productRepository.find({
  select: ['id', 'name', 'price'],
  where: { categoryId },
});

// ❌ BAD - Fetching all fields and relations
const products = await productRepository.find({
  relations: ['category', 'store', 'prices'],
  where: { categoryId },
});

// ✅ GOOD - Use pagination
const [products, total] = await productRepository.findAndCount({
  skip: (page - 1) * limit,
  take: limit,
});

// ✅ GOOD - Use caching
const cacheKey = `products:${categoryId}`;
const cached = await cacheService.get(cacheKey);
if (cached) return cached;

const products = await productRepository.find({ where: { categoryId } });
await cacheService.set(cacheKey, products, 3600);
```

### Frontend

```typescript
// ✅ GOOD - Memoize expensive calculations
const sortedProducts = useMemo(
  () => products.sort((a, b) => a.price - b.price),
  [products]
);

// ✅ GOOD - Memoize components
export const ProductCard = React.memo(ProductCardComponent);

// ✅ GOOD - Use callback for functions passed to children
const handleClick = useCallback(
  (product: Product) => {
    console.log(product);
  },
  []
);

// ✅ GOOD - Lazy load routes
const ProductDetail = lazy(() => import('./pages/ProductDetail'));

// ✅ GOOD - Virtual scrolling for long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={products.length}
  itemSize={100}
>
  {({ index, style }) => (
    <ProductCard product={products[index]} style={style} />
  )}
</FixedSizeList>
```

## Security Guidelines

### Input Validation

```typescript
// ✅ GOOD - Use validation schemas
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
});

// Validate in controller
@Post()
async create(@Body() dto: CreateProductDto) {
  const validated = createProductSchema.parse(dto);
  return this.productsService.create(validated);
}
```

### SQL Injection Prevention

```typescript
// ✅ GOOD - Use ORM
const product = await productRepository.findOne({ where: { id } });

// ❌ BAD - Raw SQL with user input
const product = await query(`SELECT * FROM products WHERE id = ${id}`);

// ✅ GOOD - If raw SQL needed, use parameters
const product = await query('SELECT * FROM products WHERE id = $1', [id]);
```

### XSS Prevention

```typescript
// ✅ GOOD - Sanitize HTML input
import DOMPurify from 'dompurify';

const cleanDescription = DOMPurify.sanitize(userInput);

// ✅ GOOD - Use React's built-in escaping
<div>{product.name}</div> // Automatically escaped

// ❌ BAD - Dangerous HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Authentication

```typescript
// ✅ GOOD - Use guards
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}

// ✅ GOOD - Role-based access
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
delete(@Param('id') id: string) {
  return this.service.delete(id);
}
```

## Debugging Tips

### Backend Debugging

```typescript
// Use logger instead of console.log
this.logger.debug('Processing product', { productId });
this.logger.error('Failed to save', error);

// Use debugging breakpoints
// In VS Code, add to launch.json:
{
  "type": "node",
  "request": "attach",
  "name": "Attach to NestJS",
  "port": 9229,
  "restart": true
}

// Then run:
npm run start:debug
```

### Frontend Debugging

```typescript
// Use React DevTools
// Install extension and inspect components

// Use Redux DevTools
// Track state changes

// Use console methods wisely
console.table(products);
console.group('Product Details');
console.log('Name:', product.name);
console.log('Price:', product.price);
console.groupEnd();

// Performance profiling
console.time('search');
await searchProducts(query);
console.timeEnd('search');
```

## Common Issues & Solutions

### Issue: Port already in use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Issue: Database connection error

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
docker-compose restart postgres

# Check connection
npm run db:ping
```

### Issue: Node modules out of sync

```bash
# Clean and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Or use clean install
npm ci
```

### Issue: TypeScript errors after pull

```bash
# Clean TypeScript cache
npx tsc --build --clean

# Rebuild
npm run build
```

## Helpful Commands

```bash
# Development
npm run dev                    # Start all apps
npm run dev:backend           # Start backend only
npm run dev:web               # Start web only
npm run dev:mobile            # Start mobile only

# Building
npm run build                 # Build all
npm run build:backend         # Build backend
npm run build:web             # Build web

# Testing
npm run test                  # Run all tests
npm run test:watch            # Run tests in watch mode
npm run test:cov              # Run with coverage
npm run test:e2e              # Run E2E tests

# Linting
npm run lint                  # Lint all
npm run lint:fix              # Auto-fix issues
npm run format                # Format code
npm run format:check          # Check formatting

# Database
npm run migrate               # Run migrations
npm run migrate:rollback      # Rollback last migration
npm run seed                  # Seed database
npm run db:reset              # Reset database

# Docker
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f        # View logs
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Turborepo Documentation](https://turbo.build/repo/docs)

---

**Version**: 1.0  
**Last Updated**: 2026-02-08  
**Maintained By**: Development Team
