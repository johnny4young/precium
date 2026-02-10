# API Communication Protocol Analysis

## Executive Summary

This document analyzes different API communication protocols for the Precium application, comparing REST, gRPC, tRPC, and GraphQL to determine the best approach for communication between backend (Golang), web (React), and mobile (React Native) clients.

## Communication Protocols Comparison

### 1. REST (REpresentational State Transfer)

**Description**: HTTP-based architectural style using JSON over HTTP/HTTPS.

#### Pros ✅
- **Universal Support**: Works everywhere, no special tooling needed
- **Simple & Well-Understood**: Easy to learn and debug
- **HTTP Native**: Leverages standard HTTP methods (GET, POST, PUT, DELETE)
- **Caching**: Built-in HTTP caching mechanisms
- **Tooling**: Extensive tooling (Swagger/OpenAPI, Postman)
- **Browser Compatible**: Direct fetch/axios calls from browsers
- **Stateless**: Scales horizontally easily

#### Cons ❌
- **Over/Under-fetching**: Can't request specific fields
- **Multiple Roundtrips**: N+1 problem for nested resources
- **No Type Safety**: JSON doesn't provide compile-time type checking
- **Versioning Challenges**: API versioning can be complex
- **Larger Payloads**: JSON is verbose compared to binary formats

#### Best For
- Public APIs
- Simple CRUD operations
- Wide client compatibility requirements
- When HTTP caching is important

---

### 2. gRPC (Google Remote Procedure Call)

**Description**: High-performance RPC framework using Protocol Buffers (Protobuf) for serialization.

#### Pros ✅
- **Performance**: Binary protocol (Protobuf) is faster and smaller than JSON
- **Type Safety**: Strong typing with code generation for multiple languages
- **Streaming**: Built-in support for bidirectional streaming
- **Code Generation**: Auto-generate client/server code from .proto files
- **Efficient**: Lower bandwidth and faster serialization
- **Language Agnostic**: Excellent support for Go, Java, C++, Python
- **Contract-First**: Schema-driven development

#### Cons ❌
- **Browser Support**: Limited direct browser support (needs gRPC-Web proxy)
- **Debugging**: Binary format harder to debug than JSON
- **Learning Curve**: More complex than REST
- **Tooling**: Less mature ecosystem compared to REST
- **Human Readability**: Not human-readable in transit
- **React Native**: Additional complexity for mobile apps

#### Best For
- Microservice-to-microservice communication
- High-performance internal APIs
- Polyglot environments
- When streaming is required
- Server-to-server communication

---

### 3. tRPC (TypeScript Remote Procedure Call)

**Description**: End-to-end type-safe API framework for TypeScript applications.

#### Pros ✅
- **Full Type Safety**: End-to-end TypeScript types without code generation
- **Developer Experience**: Excellent DX with autocompletion and type inference
- **No Code Generation**: Types inferred directly from implementation
- **Simple Setup**: Minimal boilerplate
- **React Integration**: Excellent React Query integration
- **Automatic Validation**: Runtime validation with Zod
- **Small Bundle**: Lightweight library

#### Cons ❌
- **TypeScript Only**: Requires TypeScript on both client and server
- **Not Language Agnostic**: Won't work with Golang backend
- **Monorepo Recommended**: Works best with shared code
- **Limited to HTTP**: No advanced features like streaming
- **Ecosystem**: Smaller ecosystem than REST or gRPC

#### Best For
- Full TypeScript stacks (Node.js backend + React frontend)
- Monorepo architectures
- Rapid development with type safety
- **NOT suitable for our Golang backend** ❌

---

### 4. GraphQL

**Description**: Query language for APIs with a type system.

#### Pros ✅
- **Flexible Queries**: Clients request exactly what they need
- **Single Endpoint**: One endpoint for all queries
- **Strong Typing**: Schema-driven with type safety
- **No Over-fetching**: Solves the over/under-fetching problem
- **Real-time**: Built-in subscriptions for real-time updates
- **Introspection**: Self-documenting API
- **Ecosystem**: Rich tooling (Apollo, Relay)

#### Cons ❌
- **Complexity**: More complex than REST to implement
- **Caching**: HTTP caching doesn't work well
- **Learning Curve**: Requires learning new query language
- **Over-fetching Prevention Needed**: Clients can make expensive queries
- **Golang Support**: Less mature than Node.js ecosystem
- **Bundle Size**: Larger client libraries

#### Best For
- Complex data relationships
- Mobile apps with bandwidth constraints
- When clients need flexibility in queries
- Real-time applications

---

## Detailed Comparison Matrix

| Feature | REST | gRPC | tRPC | GraphQL |
|---------|------|------|------|---------|
| **Performance** | Good | Excellent | Good | Good |
| **Type Safety** | ❌ | ✅ | ✅ | ✅ |
| **Browser Support** | ✅ | ⚠️ (needs proxy) | ✅ | ✅ |
| **Mobile Support** | ✅ | ⚠️ | ✅ | ✅ |
| **Golang Support** | ✅ | ✅ | ❌ | ⚠️ |
| **Developer Experience** | Good | Good | Excellent | Good |
| **Learning Curve** | Low | Medium | Low | Medium-High |
| **Streaming** | ❌ | ✅ | ❌ | ✅ (subscriptions) |
| **Caching** | ✅ | ❌ | ⚠️ | ❌ |
| **Tooling** | Excellent | Good | Good | Excellent |
| **Bundle Size** | Small | Medium | Small | Large |
| **Debugging** | Easy | Hard | Easy | Medium |
| **Code Generation** | Optional | Required | Not needed | Optional |
| **Bandwidth** | Medium | Low | Medium | Medium-Low |

---

## Use Case Analysis for Precium

### Our Architecture
- **Backend**: Golang (high performance, strong typing)
- **Web Frontend**: React + TypeScript
- **Mobile**: React Native + TypeScript

### Communication Patterns

1. **Client-to-Backend** (Web/Mobile → Golang API)
   - Product search queries
   - User authentication
   - Shopping list CRUD
   - Price queries
   - Route optimization requests

2. **Potential Future Microservices**
   - OCR service communication
   - Route optimization service
   - Notification service

---

## Recommendations

### 🎯 Recommended: **REST with Protocol Buffers for Internal Services**

**Primary API: REST**
- Use REST/JSON for all client-facing APIs (web and mobile)
- Standard HTTP/HTTPS with JSON
- OpenAPI/Swagger documentation

**Internal Services: gRPC** (when needed)
- Use gRPC between backend microservices
- High-performance service-to-service communication
- Especially for route optimization and heavy computations

### Why This Hybrid Approach?

#### For Client-to-Backend (REST) ✅

**Rationale:**
1. **Universal Compatibility**: Works seamlessly with browsers and React Native
2. **Simple Debugging**: Easy to test with curl, Postman, browser DevTools
3. **HTTP Ecosystem**: Leverage HTTP caching, CDNs, load balancers
4. **Developer Familiarity**: Most developers know REST
5. **Third-party Integration**: Easy for future API partners
6. **Mobile Bandwidth**: JSON compression works well

**Implementation:**
```go
// Golang REST API with Fiber/Gin
package main

import (
    "github.com/gofiber/fiber/v2"
)

func main() {
    app := fiber.New()
    
    // REST endpoints
    app.Get("/api/v1/products", getProducts)
    app.Post("/api/v1/auth/login", login)
    
    app.Listen(":3000")
}
```

**TypeScript Client:**
```typescript
// Shared types package
export interface Product {
  id: string;
  name: string;
  price: number;
}

// API client
export const api = {
  getProducts: async (): Promise<Product[]> => {
    const response = await fetch('/api/v1/products');
    return response.json();
  }
};
```

#### For Service-to-Service (gRPC) ✅

**Rationale:**
1. **Performance**: Binary protocol for faster communication
2. **Type Safety**: Protocol Buffers ensure contract compliance
3. **Streaming**: Useful for route calculations and large datasets
4. **Efficiency**: Lower bandwidth for internal communication

**When to Use:**
- Route optimization service (heavy computation)
- OCR processing service (binary data transfer)
- Real-time price updates between services
- Analytics data aggregation

**Implementation:**
```protobuf
// route_service.proto
syntax = "proto3";

package route;

service RouteService {
  rpc OptimizeRoute(RouteRequest) returns (RouteResponse);
  rpc StreamDirections(RouteRequest) returns (stream Direction);
}

message RouteRequest {
  repeated string product_ids = 1;
  Location user_location = 2;
  OptimizationMode mode = 3;
}
```

---

## Alternative Considered: Full GraphQL

### Why NOT GraphQL for Precium?

1. **Complexity**: Overkill for our use cases
2. **Golang Ecosystem**: Less mature than Node.js
3. **Caching**: REST caching is simpler and more effective
4. **Mobile Performance**: REST with proper pagination is sufficient
5. **Development Speed**: REST is faster to implement initially

### When to Reconsider GraphQL:
- If frontend needs become very complex
- If we need real-time subscriptions extensively
- If over-fetching becomes a major problem
- After we have 50+ REST endpoints

---

## Why NOT tRPC?

tRPC requires TypeScript on both client and server. Since we're using **Golang for the backend**, tRPC is **not an option**.

**Key Limitation:**
```typescript
// tRPC requires TypeScript server
import { initTRPC } from '@trpc/server';

// This won't work with Golang backend ❌
```

---

## Implementation Strategy

### Phase 1: REST Foundation (Iterations 1-3)
```
Client (React/RN) ←→ REST/JSON ←→ Golang Backend
                                    ↓
                              PostgreSQL + Redis
```

- Implement all client-facing APIs with REST
- Use standard HTTP methods and status codes
- JSON request/response bodies
- JWT authentication
- OpenAPI documentation

### Phase 2: Add gRPC for Internal Services (Iteration 4+)
```
Client ←→ REST ←→ API Gateway (Golang)
                       ↓
                    gRPC
                       ↓
           ┌───────────┴──────────┐
           ↓                      ↓
    Route Service          OCR Service
      (Golang)              (Golang)
```

### Phase 3: Optimization (Post-Launch)
- Add HTTP/2 for REST endpoints
- Implement gRPC-Web if needed for browser streaming
- Consider GraphQL if complexity warrants it

---

## Type Safety Strategy

Since we can't use tRPC with Golang, we'll use **code generation** for type safety:

### 1. OpenAPI/Swagger Code Generation

**Golang Backend:**
```bash
# Generate OpenAPI spec from code
swag init
```

**TypeScript Client:**
```bash
# Generate TypeScript types from OpenAPI
npx openapi-typescript ./api-spec.yaml -o ./types/api.ts
```

### 2. Shared Type Definitions

```typescript
// packages/shared-types/src/api.types.ts
// Manually maintained types that match Golang structs
export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
}
```

### 3. Runtime Validation

**Golang (using validation tags):**
```go
type Product struct {
    ID    string  `json:"id" validate:"required,uuid"`
    Name  string  `json:"name" validate:"required,min=3,max=100"`
    Price float64 `json:"price" validate:"required,gt=0"`
}

// Usage with validator
import "github.com/go-playground/validator/v10"

validate := validator.New()
err := validate.Struct(product)
```

**TypeScript (using Zod):**
```typescript
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100),
  price: z.number().positive()
});
```

---

## API Design Patterns

### 1. RESTful Resources

```
GET    /api/v1/products              # List products
GET    /api/v1/products/:id          # Get product
POST   /api/v1/products              # Create product
PUT    /api/v1/products/:id          # Update product
DELETE /api/v1/products/:id          # Delete product

GET    /api/v1/products/:id/stores   # Get stores for product
```

### 2. Nested Resources

```
GET    /api/v1/stores/:id/products   # Products in store
POST   /api/v1/shopping-lists/:id/items  # Add item to list
```

### 3. Search & Filter

```
GET    /api/v1/search/products?q=milk&lat=40.7&lon=-74.0&radius=1000
GET    /api/v1/products?category=dairy&minPrice=1.00&maxPrice=5.00
```

### 4. Actions/RPC Style

```
POST   /api/v1/routes/optimize      # Non-CRUD operation
POST   /api/v1/auth/refresh          # Token refresh
POST   /api/v1/ocr/upload            # Receipt upload
```

---

## Performance Optimizations

### 1. HTTP/2
- Multiplexing requests
- Server push capabilities
- Header compression

### 2. Response Compression
```go
app.Use(compress.New(compress.Config{
    Level: compress.LevelBestSpeed,
}))
```

### 3. Caching Headers
```go
c.Set("Cache-Control", "public, max-age=3600")
c.Set("ETag", calculateETag(data))
```

### 4. Pagination
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1000,
    "hasMore": true
  }
}
```

---

## Security Considerations

### 1. Rate Limiting
```go
app.Use(limiter.New(limiter.Config{
    Max: 100,
    Expiration: 1 * time.Minute,
}))
```

### 2. CORS
```go
app.Use(cors.New(cors.Config{
    AllowOrigins: "https://precium.com",
    AllowMethods: "GET,POST,PUT,DELETE",
    AllowHeaders: "Authorization, Content-Type",
}))
```

### 3. Input Validation
- Validate all inputs server-side
- Use Golang validator package
- Sanitize user inputs

### 4. Authentication
- JWT tokens in Authorization header
- Refresh tokens in httpOnly cookies
- HTTPS only in production

---

## Monitoring & Debugging

### Backend Advantages for Debugging:
1. **Browser DevTools**: Inspect requests/responses easily
2. **Curl Testing**: Simple command-line testing
3. **Postman/Insomnia**: Rich GUI tools
4. **Logging**: Easy to log JSON payloads

```bash
# Easy debugging with REST
curl -X GET https://api.precium.com/api/v1/products \
  -H "Authorization: Bearer <token>"

# Test Golang backend locally
curl http://localhost:3000/api/v1/health
```

### gRPC Debugging (Internal Services):
1. **grpcurl**: CLI tool for gRPC
2. **BloomRPC**: GUI tool
3. **Structured Logging**: Log protobuf messages

---

## Migration Path

### If We Outgrow REST:

**Step 1**: Identify bottlenecks
- Profile API endpoints
- Measure bandwidth usage
- Analyze client-side performance

**Step 2**: Selective Migration
- Keep REST for simple CRUD
- Move complex queries to GraphQL
- Move high-frequency calls to gRPC-Web

**Step 3**: Gradual Rollout
- Version APIs (v1 = REST, v2 = GraphQL)
- Support both during transition
- Deprecate old endpoints gradually

---

## Conclusion

### ✅ Final Recommendation: REST for Client APIs

**For Precium, REST is the optimal choice because:**

1. **Simplicity**: Fastest to implement and maintain
2. **Compatibility**: Works perfectly with React, React Native, and Golang
3. **Ecosystem**: Mature tooling and libraries
4. **Debugging**: Easy to troubleshoot
5. **Caching**: Built-in HTTP caching
6. **Performance**: Good enough for our scale
7. **Type Safety**: Achievable through code generation

**gRPC for internal services** when/if we need:
- High-performance microservice communication
- Binary data transfer (OCR, images)
- Bidirectional streaming

**GraphQL** is a future option if:
- Frontend complexity grows significantly
- We need real-time subscriptions everywhere
- Over-fetching becomes a major issue

### Implementation Priority:

1. **Phase 1 (Now)**: REST/JSON APIs for all client communication
2. **Phase 2 (Iteration 4+)**: gRPC for internal services if needed
3. **Phase 3 (Post-launch)**: Consider GraphQL based on metrics

This gives us the best balance of:
- ⚡ Development speed
- 🔒 Type safety (through code generation)
- 🚀 Performance
- 🛠️ Maintainability
- 📈 Scalability

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-08  
**Decision**: REST for client APIs, gRPC for internal services  
**Review**: After Iteration 3 based on performance metrics
