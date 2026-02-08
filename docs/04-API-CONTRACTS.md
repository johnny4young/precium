# API Contracts and Data Models

## Overview

This document defines the REST API contracts, request/response schemas, and data models for the Precium application.

## API Design Principles

1. **RESTful**: Follow REST conventions
2. **Versioned**: `/api/v1/...` for future compatibility
3. **JSON**: All requests and responses in JSON
4. **Pagination**: Cursor-based or offset-based
5. **Error Handling**: Consistent error format
6. **Authentication**: JWT Bearer tokens
7. **Rate Limiting**: Per endpoint and user

## Base URL

```
Production:   https://api.precium.com/api/v1
Development:  http://localhost:3000/api/v1
```

## Common Types

### Coordinates
```typescript
interface Coordinates {
  latitude: number;   // -90 to 90
  longitude: number;  // -180 to 180
}
```

### Pagination Request
```typescript
interface PaginationQuery {
  page?: number;      // Default: 1
  limit?: number;     // Default: 20, Max: 100
  cursor?: string;    // For cursor-based pagination
}
```

### Pagination Response
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}
```

### Error Response
```typescript
interface ErrorResponse {
  error: {
    code: string;           // e.g., "VALIDATION_ERROR"
    message: string;        // Human-readable message
    details?: any;          // Additional details
    timestamp: string;      // ISO 8601
    path: string;          // API endpoint
    requestId: string;     // For tracking
  };
}

// Example:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid coordinates provided",
    "details": {
      "latitude": "Must be between -90 and 90"
    },
    "timestamp": "2026-02-08T15:12:21.715Z",
    "path": "/api/v1/search/stores",
    "requestId": "req_abc123"
  }
}
```

## Authentication API

### POST /auth/register
Register a new user with email/password.

**Request**:
```typescript
{
  email: string;        // Valid email format
  password: string;     // Min 8 chars, 1 uppercase, 1 number
  name: string;         // User's display name
}
```

**Response**: `201 Created`
```typescript
{
  user: User;
  tokens: {
    accessToken: string;   // JWT, expires in 15 min
    refreshToken: string;  // Expires in 7 days
    expiresIn: number;     // Seconds until expiry
  };
}
```

### POST /auth/login
Login with email/password.

**Request**:
```typescript
{
  email: string;
  password: string;
}
```

**Response**: `200 OK`
```typescript
{
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
```

### GET /auth/google
Redirect to Google OAuth.

**Response**: `302 Redirect` to Google

### GET /auth/google/callback
OAuth callback from Google.

**Query Params**:
```typescript
{
  code: string;    // OAuth authorization code
  state?: string;  // CSRF token
}
```

**Response**: `302 Redirect` to frontend with tokens in URL or cookies

### POST /auth/refresh
Refresh access token.

**Request**:
```typescript
{
  refreshToken: string;
}
```

**Response**: `200 OK`
```typescript
{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

### GET /auth/me
Get current user info.

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```typescript
{
  user: User;
}
```

### POST /auth/logout
Logout and invalidate tokens.

**Headers**: `Authorization: Bearer <token>`

**Response**: `204 No Content`

## Search API

### GET /search/products
Search for products by name and location.

**Query Parameters**:
```typescript
{
  q: string;             // Search query
  lat: number;           // User latitude
  lon: number;           // User longitude
  radius?: number;       // Radius in meters, default: 1000
  category?: string;     // Filter by category
  minPrice?: number;     // Minimum price
  maxPrice?: number;     // Maximum price
  inStock?: boolean;     // Only in-stock items
  page?: number;
  limit?: number;
}
```

**Response**: `200 OK`
```typescript
{
  data: Array<{
    product: Product;
    stores: Array<{
      store: Store;
      price: Price;
      distance: number;      // meters
      promotion?: Promotion;
    }>;
  }>;
  pagination: PaginationInfo;
}
```

### GET /search/stores
Find stores near location.

**Query Parameters**:
```typescript
{
  lat: number;
  lon: number;
  radius?: number;       // Default: 1000 meters
  chain?: string;        // Filter by chain name
  hasProduct?: string;   // Filter stores with specific product
  page?: number;
  limit?: number;
}
```

**Response**: `200 OK`
```typescript
{
  data: Array<{
    store: Store;
    distance: number;      // meters
    productCount?: number; // If hasProduct specified
  }>;
  pagination: PaginationInfo;
}
```

### GET /search/products/:productId/stores
Find stores selling a specific product.

**Path Parameters**:
```typescript
{
  productId: string;  // UUID
}
```

**Query Parameters**:
```typescript
{
  lat: number;
  lon: number;
  radius?: number;
  sortBy?: 'price' | 'distance'; // Default: 'price'
  page?: number;
  limit?: number;
}
```

**Response**: `200 OK`
```typescript
{
  product: Product;
  data: Array<{
    store: Store;
    price: Price;
    distance: number;
    promotion?: Promotion;
  }>;
  pagination: PaginationInfo;
}
```

## Products API

### GET /products
List all products.

**Query Parameters**:
```typescript
{
  category?: string;
  brand?: string;
  search?: string;
  page?: number;
  limit?: number;
}
```

**Response**: `200 OK`
```typescript
{
  data: Product[];
  pagination: PaginationInfo;
}
```

### GET /products/:id
Get product details.

**Response**: `200 OK`
```typescript
{
  product: Product;
  averagePrice?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  storeCount: number;
}
```

### POST /products
Create a new product (Admin only).

**Headers**: `Authorization: Bearer <token>`

**Request**:
```typescript
{
  name: string;
  description?: string;
  categoryId: string;
  brand?: string;
  barcode?: string;
  imageUrl?: string;
  unit: string;
}
```

**Response**: `201 Created`
```typescript
{
  product: Product;
}
```

### PUT /products/:id
Update product (Admin only).

**Request**: Same as POST

**Response**: `200 OK`
```typescript
{
  product: Product;
}
```

## Stores API

### GET /stores
List stores.

**Query Parameters**:
```typescript
{
  chain?: string;
  city?: string;
  page?: number;
  limit?: number;
}
```

**Response**: `200 OK`
```typescript
{
  data: Store[];
  pagination: PaginationInfo;
}
```

### GET /stores/:id
Get store details.

**Response**: `200 OK`
```typescript
{
  store: Store;
  productCount: number;
  averagePrice?: number;
}
```

### GET /stores/:id/products
Get products available at store.

**Query Parameters**:
```typescript
{
  category?: string;
  inStock?: boolean;
  page?: number;
  limit?: number;
}
```

**Response**: `200 OK`
```typescript
{
  store: Store;
  data: Array<{
    product: Product;
    price: Price;
    promotion?: Promotion;
  }>;
  pagination: PaginationInfo;
}
```

### POST /stores
Create store (Admin only).

**Request**:
```typescript
{
  name: string;
  chainId?: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  operatingHours?: {
    [day: string]: {  // 'monday', 'tuesday', etc.
      open: string;   // '09:00'
      close: string;  // '21:00'
      closed?: boolean;
    };
  };
  amenities?: string[];  // ['parking', 'wifi', 'wheelchair_accessible']
}
```

**Response**: `201 Created`
```typescript
{
  store: Store;
}
```

## Prices API

### GET /prices/product/:productId/store/:storeId
Get current price for product at store.

**Response**: `200 OK`
```typescript
{
  price: Price;
  history?: Array<{
    price: number;
    date: string;
  }>;
}
```

### GET /prices/product/:productId/history
Get price history for product across all stores.

**Query Parameters**:
```typescript
{
  startDate?: string;  // ISO 8601
  endDate?: string;
  storeId?: string;    // Filter by store
}
```

**Response**: `200 OK`
```typescript
{
  product: Product;
  data: Array<{
    store: Store;
    prices: Array<{
      price: number;
      date: string;
      source: string;
    }>;
  }>;
}
```

### POST /prices
Create/update price (Authenticated).

**Request**:
```typescript
{
  productId: string;
  storeId: string;
  price: number;
  currency?: string;     // Default: 'USD'
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  source?: string;       // 'user', 'ocr', 'manual'
}
```

**Response**: `201 Created`
```typescript
{
  price: Price;
  verified: boolean;  // Auto-verify if admin, else pending
}
```

### GET /prices/trends
Get price trends.

**Query Parameters**:
```typescript
{
  productId?: string;
  categoryId?: string;
  storeId?: string;
  period?: '7d' | '30d' | '90d' | '1y';
}
```

**Response**: `200 OK`
```typescript
{
  trends: Array<{
    date: string;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    dataPoints: number;
  }>;
}
```

## Route Optimization API

### POST /routes/optimize
Calculate optimal shopping route.

**Request**:
```typescript
{
  userLocation: Coordinates;
  products: Array<{
    productId: string;
    quantity?: number;
  }>;
  optimizationMode: 'distance' | 'price';
  maxStores?: number;      // Default: 5
  maxRadius?: number;      // Meters, default: 5000
  returnToStart?: boolean; // Return to origin, default: false
}
```

**Response**: `200 OK`
```typescript
{
  route: {
    id: string;
    stores: Array<{
      store: Store;
      order: number;        // Visit order
      products: Array<{
        product: Product;
        price: Price;
        quantity: number;
      }>;
      distance: number;     // From previous stop
      duration: number;     // Seconds from previous stop
    }>;
    totals: {
      distance: number;     // Total meters
      duration: number;     // Total seconds
      cost: number;         // Total price
      savings?: number;     // vs. shopping at one store
    };
    directions?: {
      // Google Maps directions
      polyline: string;
      steps: Array<any>;
    };
  };
}
```

### GET /routes/:id
Get saved route details.

**Response**: `200 OK`
```typescript
{
  route: SavedRoute;
}
```

### GET /routes/:id/navigation
Get turn-by-turn navigation.

**Response**: `200 OK`
```typescript
{
  route: SavedRoute;
  navigation: {
    currentStep: number;
    steps: Array<{
      instruction: string;
      distance: number;
      duration: number;
      maneuver: string;
    }>;
  };
}
```

## Shopping Lists API

### GET /shopping-lists
Get user's shopping lists.

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```typescript
{
  data: ShoppingList[];
}
```

### GET /shopping-lists/:id
Get shopping list details.

**Response**: `200 OK`
```typescript
{
  list: ShoppingList;
  items: ShoppingListItem[];
  estimatedCost?: {
    min: number;
    max: number;
    average: number;
  };
}
```

### POST /shopping-lists
Create shopping list.

**Request**:
```typescript
{
  name: string;
  items?: Array<{
    productId?: string;
    productName?: string;  // If product not in DB
    quantity: number;
    unit: string;
  }>;
}
```

**Response**: `201 Created`
```typescript
{
  list: ShoppingList;
}
```

### PUT /shopping-lists/:id
Update shopping list.

**Request**: Same as POST

**Response**: `200 OK`
```typescript
{
  list: ShoppingList;
}
```

### POST /shopping-lists/:id/items
Add item to list.

**Request**:
```typescript
{
  productId?: string;
  productName?: string;
  quantity: number;
  unit: string;
}
```

**Response**: `201 Created`
```typescript
{
  item: ShoppingListItem;
}
```

### PUT /shopping-lists/:listId/items/:itemId
Update list item.

**Request**:
```typescript
{
  quantity?: number;
  checked?: boolean;
}
```

**Response**: `200 OK`
```typescript
{
  item: ShoppingListItem;
}
```

### DELETE /shopping-lists/:listId/items/:itemId
Remove item from list.

**Response**: `204 No Content`

## OCR (Receipt Scanning) API

### POST /ocr/upload
Upload receipt image for processing.

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request**:
```typescript
{
  image: File;           // Image file
  storeId?: string;      // If known
  date?: string;         // Purchase date
}
```

**Response**: `202 Accepted`
```typescript
{
  job: {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    imageUrl: string;
    createdAt: string;
  };
}
```

### GET /ocr/jobs/:id
Get OCR job status and results.

**Response**: `200 OK`
```typescript
{
  job: {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    imageUrl: string;
    results?: {
      store?: {
        name: string;
        confidence: number;
        matched?: Store;
      };
      date?: string;
      total?: number;
      items: Array<{
        productName: string;
        price: number;
        quantity?: number;
        confidence: number;
        matched?: Product;  // If product found in DB
      }>;
    };
    error?: string;
    createdAt: string;
    completedAt?: string;
  };
}
```

### POST /ocr/jobs/:id/review
Review and approve OCR results.

**Request**:
```typescript
{
  items: Array<{
    ocrItemId: string;
    action: 'approve' | 'reject' | 'modify';
    modifications?: {
      productId?: string;
      productName?: string;
      price?: number;
    };
  }>;
}
```

**Response**: `200 OK`
```typescript
{
  approved: number;
  rejected: number;
  modified: number;
  pricesUpdated: Price[];
}
```

### GET /ocr/pending
Get pending OCR reviews (Admin/Moderator).

**Query Parameters**:
```typescript
{
  page?: number;
  limit?: number;
}
```

**Response**: `200 OK`
```typescript
{
  data: OcrJob[];
  pagination: PaginationInfo;
}
```

## Promotions API

### GET /promotions
Get active promotions.

**Query Parameters**:
```typescript
{
  lat?: number;
  lon?: number;
  radius?: number;
  productId?: string;
  storeId?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}
```

**Response**: `200 OK`
```typescript
{
  data: Array<{
    promotion: Promotion;
    product: Product;
    store: Store;
    distance?: number;  // If location provided
  }>;
  pagination: PaginationInfo;
}
```

### GET /promotions/:id
Get promotion details.

**Response**: `200 OK`
```typescript
{
  promotion: Promotion;
  product: Product;
  store: Store;
}
```

## Data Models

### User
```typescript
interface User {
  id: string;              // UUID
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google' | 'apple' | 'github' | 'email';
  providerId?: string;
  createdAt: string;       // ISO 8601
  updatedAt: string;
  lastLogin?: string;
}
```

### Store
```typescript
interface Store {
  id: string;
  name: string;
  chainId?: string;
  chain?: StoreChain;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  operatingHours?: {
    [day: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  amenities?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Product
```typescript
interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: Category;
  brand?: string;
  barcode?: string;
  imageUrl?: string;
  unit: string;          // 'kg', 'liter', 'unit', etc.
  createdAt: string;
  updatedAt: string;
}
```

### Price
```typescript
interface Price {
  id: string;
  productId: string;
  product?: Product;
  storeId: string;
  store?: Store;
  price: number;
  currency: string;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  validFrom: string;
  validUntil?: string;
  source: 'user' | 'store' | 'ocr' | 'scraper';
  verified: boolean;
  createdBy?: string;
  createdAt: string;
}
```

### Promotion
```typescript
interface Promotion {
  id: string;
  productId?: string;
  product?: Product;
  storeId: string;
  store?: Store;
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'buy_x_get_y';
  discountValue: number;
  originalPrice?: number;
  promotionPrice?: number;
  startDate: string;
  endDate: string;
  conditions?: any;      // JSON conditions
  createdAt: string;
}
```

### ShoppingList
```typescript
interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

### ShoppingListItem
```typescript
interface ShoppingListItem {
  id: string;
  listId: string;
  productId?: string;
  product?: Product;
  productName?: string;  // If product not in DB
  quantity: number;
  unit: string;
  checked: boolean;
  createdAt: string;
}
```

### Category
```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  parent?: Category;
  imageUrl?: string;
  createdAt: string;
}
```

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Maintenance mode |

## Rate Limiting

```typescript
const rateLimits = {
  // Per IP address
  anonymous: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100                    // requests
  },
  
  // Per authenticated user
  authenticated: {
    windowMs: 15 * 60 * 1000,
    max: 500
  },
  
  // Specific endpoints
  endpoints: {
    '/ocr/upload': {
      windowMs: 60 * 60 * 1000,  // 1 hour
      max: 10                     // uploads
    },
    '/routes/optimize': {
      windowMs: 60 * 1000,        // 1 minute
      max: 5                      // calculations
    }
  }
};
```

## Versioning Strategy

- Current version: `v1`
- Major version in URL: `/api/v1/...`
- Backward compatibility within major version
- Deprecation notices 6 months before removal
- Support N-1 versions (current + previous)

---

**Version**: 1.0
**Last Updated**: 2026-02-08
**API Status**: Design Phase
