# Folder Structure & Best Practices

## Monorepo Structure

```
precium/
├── .github/                          # GitHub configuration
│   ├── workflows/                    # CI/CD workflows
│   │   ├── ci.yml                   # Continuous integration
│   │   ├── deploy-backend.yml       # Backend deployment
│   │   ├── deploy-web.yml           # Web deployment
│   │   └── deploy-mobile.yml        # Mobile build and deploy
│   ├── ISSUE_TEMPLATE/              # Issue templates
│   ├── PULL_REQUEST_TEMPLATE.md     # PR template
│   └── copilot-instructions.md      # Copilot instructions
│
├── apps/                             # Applications
│   ├── backend/                     # Golang Backend
│   │   ├── cmd/
│   │   │   └── server/
│   │   │       └── main.go          # Entry point
│   │   │
│   │   ├── internal/
│   │   │   ├── auth/                # Authentication
│   │   │   │   ├── handler.go
│   │   │   │   ├── service.go
│   │   │   │   ├── repository.go
│   │   │   │   ├── middleware.go
│   │   │   │   └── oauth2.go       # OAuth2 implementation
│   │   │   │
│   │   │   ├── users/              # Users module
│   │   │   │   ├── handler.go
│   │   │   │   ├── service.go
│   │   │   │   ├── repository.go
│   │   │   │   └── models.go
│   │   │   │
│   │   │   ├── products/           # Products module
│   │   │   │   ├── handler.go
│   │   │   │   ├── service.go
│   │   │   │   ├── repository.go
│   │   │   │   └── models.go
│   │   │   │
│   │   │   ├── stores/             # Stores module
│   │   │   │   ├── handler.go
│   │   │   │   ├── service.go
│   │   │   │   ├── repository.go
│   │   │   │   └── models.go
│   │   │   │
│   │   │   ├── prices/             # Prices module
│   │   │   │   ├── handler.go
│   │   │   │   ├── service.go
│   │   │   │   ├── repository.go
│   │   │   │   └── models.go
│   │   │   │
│   │   │   ├── search/             # Search module
│   │   │   │   ├── handler.go
│   │   │   │   ├── service.go
│   │   │   │   └── models.go
│   │   │   │
│   │   │   ├── routes/             # Route optimization
│   │   │   │   ├── handler.go
│   │   │   │   ├── service.go
│   │   │   │   ├── algorithms/
│   │   │   │   │   ├── nearest_neighbor.go
│   │   │   │   │   ├── two_opt.go
│   │   │   │   │   └── price_optimizer.go
│   │   │   │   └── models.go
│   │   │   │
│   │   │   ├── shopping_lists/    # Shopping lists
│   │   │   │   ├── handler.go
│   │   │   │   ├── service.go
│   │   │   │   ├── repository.go
│   │   │   │   └── models.go
│   │   │   │
│   │   │   ├── ocr/               # OCR processing
│   │   │   │   ├── handler.go
│   │   │   │   ├── service.go
│   │   │   │   ├── processors/
│   │   │   │   │   ├── vision_api.go
│   │   │   │   │   └── receipt_parser.go
│   │   │   │   └── models.go
│   │   │   │
│   │   │   ├── promotions/        # Promotions module
│   │   │   │   ├── handler.go
│   │   │   │   ├── service.go
│   │   │   │   ├── repository.go
│   │   │   │   └── models.go
│   │   │   │
│   │   │   ├── notifications/     # Notifications
│   │   │   │   ├── handler.go
│   │   │   │   ├── service.go
│   │   │   │   └── providers/
│   │   │   │       ├── push.go
│   │   │   │       └── email.go
│   │   │   │
│   │   │   └── common/            # Common utilities
│   │   │       ├── middleware/
│   │   │       ├── errors/
│   │   │       └── utils/
│   │   │
│   │   ├── pkg/                   # Public packages
│   │   │   ├── config/
│   │   │   ├── logger/
│   │   │   └── validator/
│   │   │
│   │   ├── db/                    # Database
│   │   │   ├── migrations/        # SQL migrations
│   │   │   ├── queries/           # SQLC queries
│   │   │   └── sqlc/              # Generated SQLC code
│   │   │
│   │   ├── .env.example
│   │   ├── go.mod
│   │   ├── go.sum
│   │   └── README.md
│   │
│   ├── web/                        # Web application (React)
│   │   ├── public/
│   │   │   ├── index.html
│   │   │   ├── manifest.json
│   │   │   └── robots.txt
│   │   │
│   │   ├── src/
│   │   │   ├── assets/            # Static assets
│   │   │   │   ├── images/
│   │   │   │   ├── fonts/
│   │   │   │   └── icons/
│   │   │   │
│   │   │   ├── components/        # Reusable components
│   │   │   │   ├── common/        # Common components
│   │   │   │   │   ├── Button/
│   │   │   │   │   │   ├── Button.tsx
│   │   │   │   │   │   ├── Button.test.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── Input/
│   │   │   │   │   ├── Card/
│   │   │   │   │   ├── Modal/
│   │   │   │   │   └── Loading/
│   │   │   │   │
│   │   │   │   ├── layout/        # Layout components
│   │   │   │   │   ├── Header/
│   │   │   │   │   ├── Footer/
│   │   │   │   │   ├── Sidebar/
│   │   │   │   │   └── Navigation/
│   │   │   │   │
│   │   │   │   ├── products/      # Product components
│   │   │   │   │   ├── ProductCard/
│   │   │   │   │   ├── ProductList/
│   │   │   │   │   ├── ProductDetail/
│   │   │   │   │   └── ProductSearch/
│   │   │   │   │
│   │   │   │   ├── stores/        # Store components
│   │   │   │   │   ├── StoreCard/
│   │   │   │   │   ├── StoreList/
│   │   │   │   │   └── StoreMap/
│   │   │   │   │
│   │   │   │   ├── shopping-lists/
│   │   │   │   │   ├── ListCard/
│   │   │   │   │   ├── ListItem/
│   │   │   │   │   └── ListEditor/
│   │   │   │   │
│   │   │   │   └── routes/        # Route components
│   │   │   │       ├── RouteMap/
│   │   │   │       ├── RouteCard/
│   │   │   │       └── RoutePlanner/
│   │   │   │
│   │   │   ├── pages/             # Page components
│   │   │   │   ├── Home/
│   │   │   │   │   ├── Home.tsx
│   │   │   │   │   └── Home.test.tsx
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── Login.tsx
│   │   │   │   │   ├── Register.tsx
│   │   │   │   │   └── Callback.tsx
│   │   │   │   ├── Search/
│   │   │   │   │   ├── SearchPage.tsx
│   │   │   │   │   └── SearchResults.tsx
│   │   │   │   ├── Products/
│   │   │   │   │   ├── ProductsPage.tsx
│   │   │   │   │   └── ProductDetailPage.tsx
│   │   │   │   ├── Stores/
│   │   │   │   │   ├── StoresPage.tsx
│   │   │   │   │   └── StoreDetailPage.tsx
│   │   │   │   ├── ShoppingLists/
│   │   │   │   │   ├── ListsPage.tsx
│   │   │   │   │   ├── ListDetailPage.tsx
│   │   │   │   │   └── CreateListPage.tsx
│   │   │   │   ├── Routes/
│   │   │   │   │   ├── RoutesPage.tsx
│   │   │   │   │   └── RoutePlannerPage.tsx
│   │   │   │   └── Profile/
│   │   │   │       ├── ProfilePage.tsx
│   │   │   │       └── SettingsPage.tsx
│   │   │   │
│   │   │   ├── hooks/             # Custom hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useProducts.ts
│   │   │   │   ├── useStores.ts
│   │   │   │   ├── useLocation.ts
│   │   │   │   └── useDebounce.ts
│   │   │   │
│   │   │   ├── services/          # API services
│   │   │   │   ├── api.ts         # Axios instance
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── products.service.ts
│   │   │   │   ├── stores.service.ts
│   │   │   │   ├── search.service.ts
│   │   │   │   └── routes.service.ts
│   │   │   │
│   │   │   ├── store/             # State management (Redux/Zustand)
│   │   │   │   ├── slices/
│   │   │   │   │   ├── auth.slice.ts
│   │   │   │   │   ├── products.slice.ts
│   │   │   │   │   └── cart.slice.ts
│   │   │   │   ├── store.ts
│   │   │   │   └── hooks.ts
│   │   │   │
│   │   │   ├── contexts/          # React contexts
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   └── ThemeContext.tsx
│   │   │   │
│   │   │   ├── utils/             # Utility functions
│   │   │   │   ├── format.ts
│   │   │   │   ├── validation.ts
│   │   │   │   ├── distance.ts
│   │   │   │   └── storage.ts
│   │   │   │
│   │   │   ├── types/             # TypeScript types
│   │   │   │   ├── user.types.ts
│   │   │   │   ├── product.types.ts
│   │   │   │   └── api.types.ts
│   │   │   │
│   │   │   ├── styles/            # Global styles
│   │   │   │   ├── index.css
│   │   │   │   ├── tailwind.css
│   │   │   │   └── variables.css
│   │   │   │
│   │   │   ├── App.tsx            # Root component
│   │   │   ├── main.tsx           # Entry point
│   │   │   └── vite-env.d.ts
│   │   │
│   │   ├── .env.example
│   │   ├── .eslintrc.cjs
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── README.md
│   │
│   └── mobile/                    # React Native app
│       ├── src/
│       │   ├── assets/           # Static assets
│       │   ├── components/       # Reusable components
│       │   ├── screens/          # Screen components
│       │   │   ├── Auth/
│       │   │   ├── Home/
│       │   │   ├── Search/
│       │   │   ├── Products/
│       │   │   ├── Stores/
│       │   │   ├── ShoppingLists/
│       │   │   ├── Routes/
│       │   │   ├── Scanner/     # Receipt scanner
│       │   │   └── Profile/
│       │   │
│       │   ├── navigation/       # Navigation
│       │   │   ├── AppNavigator.tsx
│       │   │   ├── AuthNavigator.tsx
│       │   │   └── TabNavigator.tsx
│       │   │
│       │   ├── hooks/           # Custom hooks
│       │   ├── services/        # API services
│       │   ├── store/           # State management
│       │   ├── utils/           # Utilities
│       │   ├── types/           # TypeScript types
│       │   ├── theme/           # Theme configuration
│       │   └── App.tsx
│       │
│       ├── android/             # Android native
│       ├── ios/                 # iOS native
│       ├── .env.example
│       ├── app.json
│       ├── babel.config.js
│       ├── metro.config.js
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── packages/                      # Shared packages
│   ├── shared-types/             # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── user.types.ts
│   │   │   ├── product.types.ts
│   │   │   ├── store.types.ts
│   │   │   ├── price.types.ts
│   │   │   ├── route.types.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── validation/               # Shared validation schemas
│   │   ├── src/
│   │   │   ├── schemas/
│   │   │   │   ├── user.schema.ts
│   │   │   │   ├── product.schema.ts
│   │   │   │   └── auth.schema.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api-client/               # API client library
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── products.ts
│   │   │   │   ├── stores.ts
│   │   │   │   └── search.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui-components/            # Shared UI components
│   │   ├── src/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── ProductCard/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── utils/                    # Shared utilities
│       ├── src/
│       │   ├── format.ts
│       │   ├── validation.ts
│       │   ├── distance.ts
│       │   ├── date.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                         # Documentation
│   ├── 01-TECHNOLOGY-STACK-ANALYSIS.md
│   ├── 02-MONOREPO-VS-MULTIREPO-STRATEGY.md
│   ├── 03-SYSTEM-ARCHITECTURE.md
│   ├── 04-API-CONTRACTS.md
│   ├── 05-IMPLEMENTATION-ROADMAP.md
│   ├── 06-FOLDER-STRUCTURE.md
│   ├── 07-DEVELOPMENT-GUIDELINES.md
│   ├── 08-CI-CD-STRATEGY.md
│   ├── api/                      # API documentation
│   ├── guides/                   # User guides
│   └── assets/                   # Documentation assets
│
├── scripts/                      # Build/deployment scripts
│   ├── setup.sh                 # Initial setup script
│   ├── seed-database.ts         # Database seeding
│   ├── generate-types.ts        # Type generation
│   └── deploy.sh                # Deployment script
│
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── docker-compose.yml           # Local development
├── package.json                 # Root workspace config (frontend tooling)
├── tsconfig.base.json          # Base TypeScript config (frontend)
└── README.md
```

## Best Practices

### General Principles

1. **SOLID Principles**
   - Single Responsibility
   - Open/Closed
   - Liskov Substitution
   - Interface Segregation
   - Dependency Inversion

2. **DRY (Don't Repeat Yourself)**
   - Extract common logic to shared packages
   - Reuse components across platforms
   - Share types and validation

3. **KISS (Keep It Simple, Stupid)**
   - Prefer simple solutions
   - Avoid premature optimization
   - Clear code over clever code

4. **YAGNI (You Aren't Gonna Need It)**
   - Implement features when needed
   - Don't build for imagined futures
   - Iterate based on feedback

### Code Organization

#### Backend (Golang)

**Handler Pattern**:
```go
// products/handler.go
package products

import (
    "github.com/gofiber/fiber/v2"
)

type Handler struct {
    service *Service
}

func NewHandler(service *Service) *Handler {
    return &Handler{service: service}
}

func (h *Handler) GetAll(c *fiber.Ctx) error {
    filters := ProductFilters{
        Category: c.Query("category"),
        Brand:    c.Query("brand"),
    }
    
    products, err := h.service.FindAll(c.Context(), filters)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{
            "error": err.Error(),
        })
    }
    
    return c.JSON(products)
}

func (h *Handler) Create(c *fiber.Ctx) error {
    var dto CreateProductDTO
    if err := c.BodyParser(&dto); err != nil {
        return c.Status(400).JSON(fiber.Map{
            "error": "Invalid request body",
        })
    }
    
    product, err := h.service.Create(c.Context(), dto)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{
            "error": err.Error(),
        })
    }
    
    return c.Status(201).JSON(product)
}
```

**Service Pattern**:
```go
// products/service.go
package products

import (
    "context"
    "github.com/precium/backend/db/sqlc"
)

type Service struct {
    queries *sqlc.Queries
}

func NewService(queries *sqlc.Queries) *Service {
    return &Service{queries: queries}
}

func (s *Service) FindAll(ctx context.Context, filters ProductFilters) ([]sqlc.Product, error) {
    return s.queries.ListProducts(ctx, sqlc.ListProductsParams{
        Category: filters.Category,
        Brand:    filters.Brand,
    })
}

func (s *Service) Create(ctx context.Context, dto CreateProductDTO) (sqlc.Product, error) {
    return s.queries.CreateProduct(ctx, sqlc.CreateProductParams{
        Name:        dto.Name,
        Description: dto.Description,
        CategoryID:  dto.CategoryID,
        Brand:       dto.Brand,
    })
}
```

#### Frontend (React)

**Component Structure**:
```typescript
// ProductCard.tsx
import React from 'react';
import { Product } from '@precium/shared-types';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
}) => {
  const handleClick = () => {
    onClick?.(product);
  };

  return (
    <div 
      className="product-card" 
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
};
```

**Custom Hook Pattern**:
```typescript
// useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

**Page Component Pattern**:
```typescript
// ProductsPage.tsx
export const ProductsPage: React.FC = () => {
  const [filters, setFilters] = useState<ProductFilters>({});
  const { data: products, isLoading, error } = useProducts(filters);

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div className="products-page">
      <ProductFilters onChange={setFilters} />
      <ProductList products={products} />
    </div>
  );
};
```

### Naming Conventions

#### Files
```
- Components: PascalCase (ProductCard.tsx)
- Services: camelCase (products.service.ts)
- Utilities: camelCase (format.ts)
- Types: camelCase (user.types.ts)
- Tests: same as file + .test or .spec (ProductCard.test.tsx)
```

#### Code
```typescript
// Classes & Interfaces: PascalCase
class ProductService {}
interface UserProfile {}

// Functions & Variables: camelCase
const getUserById = () => {};
const productCount = 10;

// Constants: SCREAMING_SNAKE_CASE
const MAX_ITEMS_PER_PAGE = 100;
const API_BASE_URL = 'https://api.precium.com';

// Private members: prefix with _
class Example {
  private _internalValue: string;
}

// Boolean variables: prefix with is/has/should
const isLoading = true;
const hasPermission = false;
const shouldRedirect = true;
```

### TypeScript Best Practices

```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type for unions/intersections
type Status = 'pending' | 'active' | 'inactive';
type UserWithStatus = User & { status: Status };

// Use enums for fixed sets
enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

// Use generics for reusable types
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Avoid 'any' - use 'unknown' if necessary
function processData(data: unknown) {
  if (typeof data === 'string') {
    // Type narrowing
    return data.toUpperCase();
  }
}

// Use strict null checks
function getUser(id: string): User | null {
  // Return null instead of undefined for not found
}
```

### Testing Best Practices

#### Unit Tests
```typescript
// ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 9.99,
  };

  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<ProductCard product={mockProduct} onClick={onClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(mockProduct);
  });
});
```

#### Integration Tests
```typescript
// products.service.spec.ts
describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  it('should find all products', async () => {
    const products = [{ id: '1', name: 'Product 1' }];
    jest.spyOn(repository, 'find').mockResolvedValue(products);

    expect(await service.findAll({})).toEqual(products);
  });
});
```

### Error Handling

```typescript
// Custom error classes
class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

// Error handling in services
async function getProductById(id: string): Promise<Product> {
  const product = await productsRepository.findOne({ where: { id } });
  
  if (!product) {
    throw new NotFoundError('Product', id);
  }
  
  return product;
}

// Global error handler (Golang)
package middleware

import (
    "github.com/gofiber/fiber/v2"
)

func ErrorHandler(c *fiber.Ctx, err error) error {
    code := fiber.StatusInternalServerError
    message := "Internal server error"
    
    if e, ok := err.(*fiber.Error); ok {
        code = e.Code
        message = e.Message
    }
    
    return c.Status(code).JSON(fiber.Map{
        "error": fiber.Map{
            "statusCode": code,
            "message":    message,
            "timestamp":  time.Now().Format(time.RFC3339),
            "path":       c.Path(),
        },
    })
}
```

### Security Best Practices

```typescript
// Input validation
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
});

// SQL injection prevention (use ORM)
// ❌ BAD
const products = await query(`SELECT * FROM products WHERE id = ${id}`);

// ✅ GOOD
const products = await productsRepository.findOne({ where: { id } });

// XSS prevention
// Always escape user input
import DOMPurify from 'dompurify';

const cleanHtml = DOMPurify.sanitize(userInput);

// CSRF protection
// Use CSRF tokens or SameSite cookies

// Authentication
// Always use HTTPS
// Use secure cookies
// Implement rate limiting
```

### Performance Best Practices

```typescript
// Database queries
// ✅ Use select specific fields
const products = await productsRepository.find({
  select: ['id', 'name', 'price'],
});

// ✅ Use indexes for frequent queries
@Entity()
@Index(['categoryId', 'price'])
export class Product {}

// ✅ Use pagination
const [products, total] = await productsRepository.findAndCount({
  skip: (page - 1) * limit,
  take: limit,
});

// Caching
// ✅ Cache expensive operations
const cached = await cacheService.get(cacheKey);
if (cached) return cached;

const result = await expensiveOperation();
await cacheService.set(cacheKey, result, ttl);
return result;

// React optimization
// ✅ Use React.memo for expensive components
export const ProductCard = React.memo(ProductCardComponent);

// ✅ Use useMemo for expensive calculations
const sortedProducts = useMemo(
  () => products.sort((a, b) => a.price - b.price),
  [products]
);

// ✅ Use useCallback for callbacks passed to children
const handleClick = useCallback(
  (product) => {
    console.log(product);
  },
  []
);
```

### Git Workflow

```bash
# Branch naming
feature/add-product-search
bugfix/fix-auth-redirect
hotfix/security-patch
chore/update-dependencies

# Commit messages
feat: add product search functionality
fix: resolve authentication redirect issue
docs: update API documentation
test: add unit tests for ProductService
refactor: simplify route optimization algorithm
chore: update dependencies

# Pull request workflow
1. Create feature branch from main
2. Make changes and commit
3. Push to remote
4. Open pull request
5. Code review
6. Address feedback
7. Merge to main
8. Delete feature branch
```

---

**Version**: 1.0
**Last Updated**: 2026-02-08
**Next Review**: End of Iteration 1
