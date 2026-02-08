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
│   ├── backend/                     # Backend API (NestJS)
│   │   ├── src/
│   │   │   ├── auth/               # Authentication module
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── strategies/     # Passport strategies
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   ├── google.strategy.ts
│   │   │   │   │   └── local.strategy.ts
│   │   │   │   ├── guards/         # Auth guards
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   └── roles.guard.ts
│   │   │   │   └── decorators/     # Custom decorators
│   │   │   │       ├── current-user.decorator.ts
│   │   │   │       └── roles.decorator.ts
│   │   │   │
│   │   │   ├── users/              # Users module
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── entities/
│   │   │   │   │   └── user.entity.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-user.dto.ts
│   │   │   │       └── update-user.dto.ts
│   │   │   │
│   │   │   ├── products/           # Products module
│   │   │   │   ├── products.controller.ts
│   │   │   │   ├── products.service.ts
│   │   │   │   ├── products.module.ts
│   │   │   │   ├── entities/
│   │   │   │   │   └── product.entity.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── stores/             # Stores module
│   │   │   │   ├── stores.controller.ts
│   │   │   │   ├── stores.service.ts
│   │   │   │   ├── stores.module.ts
│   │   │   │   ├── entities/
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── prices/             # Prices module
│   │   │   │   ├── prices.controller.ts
│   │   │   │   ├── prices.service.ts
│   │   │   │   ├── prices.module.ts
│   │   │   │   ├── entities/
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── search/             # Search module
│   │   │   │   ├── search.controller.ts
│   │   │   │   ├── search.service.ts
│   │   │   │   ├── search.module.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── routes/             # Route optimization
│   │   │   │   ├── routes.controller.ts
│   │   │   │   ├── routes.service.ts
│   │   │   │   ├── routes.module.ts
│   │   │   │   ├── algorithms/
│   │   │   │   │   ├── nearest-neighbor.ts
│   │   │   │   │   ├── two-opt.ts
│   │   │   │   │   └── price-optimizer.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── shopping-lists/     # Shopping lists
│   │   │   │   ├── shopping-lists.controller.ts
│   │   │   │   ├── shopping-lists.service.ts
│   │   │   │   ├── shopping-lists.module.ts
│   │   │   │   ├── entities/
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── ocr/                # OCR processing
│   │   │   │   ├── ocr.controller.ts
│   │   │   │   ├── ocr.service.ts
│   │   │   │   ├── ocr.module.ts
│   │   │   │   ├── processors/
│   │   │   │   │   ├── vision-api.processor.ts
│   │   │   │   │   └── receipt-parser.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── promotions/         # Promotions module
│   │   │   │   ├── promotions.controller.ts
│   │   │   │   ├── promotions.service.ts
│   │   │   │   ├── promotions.module.ts
│   │   │   │   ├── entities/
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── notifications/      # Notifications
│   │   │   │   ├── notifications.controller.ts
│   │   │   │   ├── notifications.service.ts
│   │   │   │   ├── notifications.module.ts
│   │   │   │   └── providers/
│   │   │   │       ├── push.provider.ts
│   │   │   │       └── email.provider.ts
│   │   │   │
│   │   │   ├── common/             # Common utilities
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/        # Exception filters
│   │   │   │   ├── interceptors/   # Interceptors
│   │   │   │   ├── pipes/          # Validation pipes
│   │   │   │   └── middleware/
│   │   │   │
│   │   │   ├── config/             # Configuration
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── auth.config.ts
│   │   │   │   └── app.config.ts
│   │   │   │
│   │   │   ├── database/           # Database
│   │   │   │   ├── migrations/
│   │   │   │   ├── seeds/
│   │   │   │   └── data-source.ts
│   │   │   │
│   │   │   ├── app.module.ts       # Root module
│   │   │   └── main.ts             # Entry point
│   │   │
│   │   ├── test/                   # E2E tests
│   │   │   ├── auth.e2e-spec.ts
│   │   │   ├── products.e2e-spec.ts
│   │   │   └── jest-e2e.json
│   │   │
│   │   ├── .env.example            # Environment template
│   │   ├── .eslintrc.js
│   │   ├── .prettierrc
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   ├── tsconfig.json
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
├── package.json                 # Root workspace config
├── turbo.json                   # Turborepo configuration
├── tsconfig.base.json          # Base TypeScript config
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

#### Backend (NestJS)

**Module Structure**:
```typescript
// products.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Export if used by other modules
})
export class ProductsModule {}
```

**Service Pattern**:
```typescript
// products.service.ts
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private cacheService: CacheService,
  ) {}

  async findAll(filters: ProductFilters): Promise<Product[]> {
    const cacheKey = `products:${JSON.stringify(filters)}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) return cached;
    
    const products = await this.productsRepository.find({
      where: filters,
    });
    
    await this.cacheService.set(cacheKey, products, 3600);
    return products;
  }
}
```

**Controller Pattern**:
```typescript
// products.controller.ts
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findAll(
    @Query() filters: ProductFiltersDto,
  ): Promise<Product[]> {
    return this.productsService.findAll(filters);
  }

  @Post()
  @Roles('admin')
  @UseGuards(RolesGuard)
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }
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

// Global exception filter (NestJS)
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    const message = exception instanceof Error
      ? exception.message
      : 'Internal server error';

    response.status(status).json({
      error: {
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
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
