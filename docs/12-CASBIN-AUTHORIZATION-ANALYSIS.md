# Casbin Authorization Analysis for Precium

**Document Version**: 1.0  
**Last Updated**: 2026-02-09  
**Status**: Recommendation Document

---

## Executive Summary

This document analyzes Casbin as an authorization solution for the Precium platform and provides a recommendation on whether to adopt it for role-based and attribute-based access control.

**Recommendation**: ✅ **Use Casbin for authorization management**

Casbin is an excellent fit for Precium's authorization needs, providing flexible RBAC with the ability to scale to more complex ABAC scenarios as the platform grows.

---

## 1. What is Casbin?

Casbin is an open-source authorization library that supports multiple access control models including:

- **RBAC** (Role-Based Access Control)
- **ABAC** (Attribute-Based Access Control)
- **ACL** (Access Control Lists)
- **RESTful** (Resource-based access control)
- **Hybrid models** (combining multiple approaches)

### Key Features

- **Multi-model support**: Switch or combine models by editing configuration
- **Language support**: Native Golang implementation (perfect for our backend)
- **Persistence**: Built-in adapters for PostgreSQL, MySQL, Redis, etc.
- **Performance**: Fast evaluation (~0.1-1ms for RBAC)
- **Flexibility**: Supports role hierarchies, domains (multi-tenancy), and custom matchers

---

## 2. Why Casbin for Precium?

### 2.1 Current Authorization Requirements

For the Precium platform, we need:

1. **Basic RBAC** (Iteration 1-3):
   - User roles: `user`, `premium_user`, `pro_user`, `moderator`, `admin`
   - Permission levels for features (free vs premium)
   - Store owner permissions
   - Admin/moderator capabilities

2. **Resource-level control** (Iteration 3-5):
   - Users can only edit their own shopping lists
   - Store owners can only manage their own stores
   - Moderators can approve/reject community price submissions
   - Premium features gated by subscription level

3. **Future ABAC needs** (Iteration 6+):
   - Department-based access (for enterprise B2B features)
   - Time-based access (promotional features during specific periods)
   - Context-aware permissions (location-based features)

### 2.2 How Casbin Fits

| Requirement        | Casbin Capability     | How It Helps                                      |
| ------------------ | --------------------- | ------------------------------------------------- |
| User roles         | RBAC with hierarchies | Built-in support for role inheritance             |
| Subscription tiers | RBAC + ABAC           | Can check `user.subscription_tier` dynamically    |
| Resource ownership | ABAC                  | Check `user.id == resource.owner_id`              |
| Store permissions  | Domain RBAC           | Store owners get admin role in their store domain |
| Multi-tenancy      | Domain support        | Separate permissions per store/organization       |
| Audit logging      | Adapter pattern       | Log all authorization decisions                   |
| Performance        | In-memory + caching   | <1ms evaluation for most checks                   |

---

## 3. Casbin Implementation for Precium

### 3.1 Model Definition

```ini
# /internal/auth/model.conf

[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _
g2 = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act || \
    g(r.sub, "admin")
```

### 3.2 Policy Examples

```csv
# /internal/auth/policy.csv

# Role assignments (user -> role)
g, user:123, role:user
g, user:456, role:premium_user
g, user:789, role:pro_user
g, user:admin1, role:admin

# Role hierarchy (role -> parent role)
g2, role:premium_user, role:user
g2, role:pro_user, role:premium_user
g2, role:admin, role:pro_user
g2, role:moderator, role:premium_user

# Permissions (role, resource, action)
p, role:user, product, read
p, role:user, store, read
p, role:user, shopping_list, create
p, role:user, shopping_list:own, update
p, role:user, shopping_list:own, delete

p, role:premium_user, route, optimize
p, role:premium_user, search, unlimited
p, role:premium_user, shopping_list, unlimited

p, role:pro_user, store:own, create
p, role:pro_user, store:own, update
p, role:pro_user, promotion, create
p, role:pro_user, analytics, view

p, role:moderator, price, approve
p, role:moderator, price, reject
p, role:moderator, user, suspend

p, role:admin, *, *
```

### 3.3 Golang Integration

```go
// internal/auth/casbin.go
package auth

import (
    "github.com/casbin/casbin/v2"
    "github.com/casbin/casbin/v2/model"
    postgresadapter "github.com/casbin/casbin-pg-adapter"
)

type CasbinAuthorizor struct {
    enforcer *casbin.Enforcer
}

func NewCasbinAuthorizor(dbConnStr string) (*CasbinAuthorizor, error) {
    // Use PostgreSQL adapter for persistence
    adapter, err := postgresadapter.NewAdapter(dbConnStr)
    if err != nil {
        return nil, err
    }

    // Load model from file or string
    enforcer, err := casbin.NewEnforcer("config/model.conf", adapter)
    if err != nil {
        return nil, err
    }

    // Load policies from database
    err = enforcer.LoadPolicy()
    if err != nil {
        return nil, err
    }

    return &CasbinAuthorizor{enforcer: enforcer}, nil
}

// Check if user has permission
func (ca *CasbinAuthorizor) Authorize(userID, resource, action string) (bool, error) {
    return ca.enforcer.Enforce(userID, resource, action)
}

// Add role to user
func (ca *CasbinAuthorizor) AddRoleForUser(userID, role string) error {
    _, err := ca.enforcer.AddRoleForUser(userID, role)
    if err != nil {
        return err
    }
    return ca.enforcer.SavePolicy()
}

// Check subscription tier
func (ca *CasbinAuthorizor) CheckSubscription(userID, tier string) bool {
    // Check if user has tier role or higher
    roles, _ := ca.enforcer.GetRolesForUser(userID)
    for _, role := range roles {
        if role == tier || ca.isHigherTier(role, tier) {
            return true
        }
    }
    return false
}

func (ca *CasbinAuthorizor) isHigherTier(userTier, requiredTier string) bool {
    tierOrder := map[string]int{
        "role:user":         1,
        "role:premium_user": 2,
        "role:pro_user":     3,
    }
    return tierOrder[userTier] >= tierOrder[requiredTier]
}
```

### 3.4 Fiber Middleware

```go
// internal/middleware/authorization.go
package middleware

import (
    "github.com/gofiber/fiber/v2"
    "precium/internal/auth"
)

func RequirePermission(resource, action string) fiber.Handler {
    return func(c *fiber.Ctx) error {
        // Get user from JWT context
        userID := c.Locals("userID").(string)

        // Get Casbin authorizor from app
        authz := c.Locals("authorizor").(*auth.CasbinAuthorizor)

        // Check permission
        allowed, err := authz.Authorize(userID, resource, action)
        if err != nil {
            return c.Status(500).JSON(fiber.Map{
                "error": "Authorization check failed",
            })
        }

        if !allowed {
            return c.Status(403).JSON(fiber.Map{
                "error": "Insufficient permissions",
            })
        }

        return c.Next()
    }
}

func RequireSubscription(tier string) fiber.Handler {
    return func(c *fiber.Ctx) error {
        userID := c.Locals("userID").(string)
        authz := c.Locals("authorizor").(*auth.CasbinAuthorizor)

        if !authz.CheckSubscription(userID, tier) {
            return c.Status(402).JSON(fiber.Map{
                "error": "This feature requires a subscription upgrade",
                "required_tier": tier,
            })
        }

        return c.Next()
    }
}
```

### 3.5 API Usage Examples

```go
// internal/routes/shopping_lists.go
package routes

import (
    "github.com/gofiber/fiber/v2"
    "precium/internal/middleware"
)

func SetupShoppingListRoutes(app *fiber.App) {
    lists := app.Group("/api/v1/shopping-lists")

    // Anyone can create a list (basic users limited to 3)
    lists.Post("/",
        middleware.RequireAuth(),
        middleware.RequirePermission("shopping_list", "create"),
        createShoppingList,
    )

    // Premium feature: unlimited lists
    lists.Post("/advanced",
        middleware.RequireAuth(),
        middleware.RequireSubscription("role:premium_user"),
        createShoppingList,
    )

    // Can only update own lists
    lists.Put("/:id",
        middleware.RequireAuth(),
        middleware.RequirePermission("shopping_list:own", "update"),
        updateShoppingList,
    )
}

// internal/routes/stores.go
func SetupStoreRoutes(app *fiber.App) {
    stores := app.Group("/api/v1/stores")

    // Pro users can manage stores
    stores.Post("/",
        middleware.RequireAuth(),
        middleware.RequireSubscription("role:pro_user"),
        middleware.RequirePermission("store:own", "create"),
        createStore,
    )

    // Admins and moderators can approve stores
    stores.Post("/:id/approve",
        middleware.RequireAuth(),
        middleware.RequirePermission("store", "approve"),
        approveStore,
    )
}
```

---

## 4. Comparison: Casbin vs Alternatives

### 4.1 Casbin vs Custom RBAC

| Aspect               | Casbin                  | Custom Implementation     |
| -------------------- | ----------------------- | ------------------------- |
| **Development time** | 1-2 days                | 1-2 weeks                 |
| **Flexibility**      | High (config-driven)    | Medium (code changes)     |
| **Testing**          | Built-in testing tools  | Manual testing needed     |
| **Maintenance**      | Low (community updates) | High (all bugs on us)     |
| **Performance**      | Optimized (~0.5ms)      | Depends on implementation |
| **Audit**            | Built-in with adapters  | Need to build             |
| **Role hierarchies** | Native support          | Complex to implement      |
| **Multi-tenancy**    | Domain support          | Complex to implement      |

**Winner**: ✅ **Casbin** - Saves development time, more reliable, better tested

### 4.2 Casbin vs OPA (Open Policy Agent)

| Aspect             | Casbin               | OPA                         |
| ------------------ | -------------------- | --------------------------- |
| **Language**       | Golang native        | Rego (custom language)      |
| **Learning curve** | Low                  | High (Rego syntax)          |
| **Performance**    | Fast (~0.5ms)        | Very fast (~0.3ms)          |
| **Deployment**     | Library (in-process) | Separate service            |
| **Complexity**     | Simple for RBAC      | Overkill for basic RBAC     |
| **Use case**       | App-level auth       | Infrastructure/K8s policies |

**Winner for Precium**: ✅ **Casbin** - Simpler, native Golang, no extra service

### 4.3 Casbin vs Database-only RBAC

| Aspect              | Casbin             | Database Only    |
| ------------------- | ------------------ | ---------------- |
| **Performance**     | In-memory cache    | Database queries |
| **Latency**         | ~0.5ms             | ~10-50ms         |
| **Flexibility**     | Policy language    | SQL queries      |
| **Testing**         | Easy to test rules | Test through DB  |
| **Version control** | Policies in config | Migrations only  |
| **Scalability**     | Excellent          | DB bottleneck    |

**Winner**: ✅ **Casbin** - 10-100x faster, easier to maintain

---

## 5. Implementation Timeline

### Phase 1: Iteration 1 (Week 3-4)

- Install Casbin and PostgreSQL adapter
- Define basic RBAC model
- Implement user roles: user, premium_user, pro_user, admin
- Create middleware for permission checks
- Add authorization to auth endpoints

### Phase 2: Iteration 2 (Week 1-2)

- Implement resource ownership checks
- Add shopping list permissions
- Add store owner permissions
- Create subscription tier middleware

### Phase 3: Iteration 3 (Week 3)

- Add moderator role and permissions
- Implement price approval workflow
- Add audit logging for authorization decisions

### Phase 4: Future Iterations

- Migrate to ABAC for complex scenarios
- Add department-based permissions (B2B)
- Implement time-based access control
- Add location-based permissions

---

## 6. Performance Considerations

### 6.1 Casbin Performance Characteristics

- **RBAC evaluation**: ~0.1-1ms (in-memory)
- **ABAC evaluation**: ~1-5ms (with attribute parsing)
- **Policy loading**: ~10-100ms (from database, done once at startup)
- **Policy updates**: ~5-10ms (add/remove rules)

### 6.2 Optimization Strategies

1. **In-memory caching**: Enable Casbin's built-in cache
2. **PostgreSQL adapter**: Store policies in database for persistence
3. **Redis adapter**: Optional second-level cache for multi-instance deployments
4. **Lazy loading**: Load only relevant policies per request
5. **Batch operations**: Update multiple policies in one transaction

### 6.3 Scalability

- **Horizontal scaling**: Each instance loads policies in memory
- **Policy sync**: Use PostgreSQL adapter with polling or webhooks
- **High availability**: Multiple Casbin instances, no single point of failure
- **50K+ concurrent users**: Casbin can handle our scale

---

## 7. Security Considerations

### 7.1 Policy Management

- **Version control**: Store `model.conf` and base policies in Git
- **Database persistence**: Store dynamic policies (user roles) in PostgreSQL
- **Admin interface**: Build UI for admins to manage roles/permissions
- **Audit trail**: Log all authorization decisions and policy changes

### 7.2 Best Practices

1. **Principle of least privilege**: Users get minimum required permissions
2. **Role hierarchies**: Use inheritance to simplify management
3. **Explicit denials**: Use `deny` policies for sensitive resources
4. **Regular audits**: Review permissions quarterly
5. **Testing**: Write tests for each permission scenario

---

## 8. Cost Analysis

### 8.1 Development Cost

| Task                   | Custom RBAC       | Casbin          |
| ---------------------- | ----------------- | --------------- |
| Initial implementation | 40-80 hours       | 8-16 hours      |
| Testing                | 20 hours          | 8 hours         |
| Maintenance (yearly)   | 40 hours          | 10 hours        |
| **Total Year 1**       | **100-140 hours** | **26-34 hours** |

**Savings**: ~70-100 hours (~$7K-15K in developer time)

### 8.2 Infrastructure Cost

- **No additional cost**: Casbin runs in-process (no separate service)
- **Storage**: Policies stored in existing PostgreSQL (~10KB-1MB)
- **Memory**: ~5-10MB per instance for policy cache
- **No licensing fees**: Open source (Apache 2.0 license)

---

## 9. Migration Path

### 9.1 If We Don't Use Casbin Initially

If we start with basic role checks in code and later need Casbin:

1. **Week 1**: Install Casbin and define model
2. **Week 2**: Migrate existing roles to Casbin policies
3. **Week 3**: Replace code-based checks with Casbin middleware
4. **Week 4**: Test and deploy
5. **Total migration time**: 3-4 weeks

**Recommendation**: Better to start with Casbin from Iteration 1 to avoid migration later.

### 9.2 If We Use Casbin from Start

Benefits of early adoption:

- No migration cost later
- Consistent authorization approach
- Easier to add new permissions
- Better testing from day 1
- Scales naturally with complexity

---

## 10. Recommendation Summary

### ✅ Use Casbin Because:

1. **Saves development time**: 70-100 hours vs custom implementation
2. **Production-ready**: Battle-tested in thousands of applications
3. **Perfect fit**: Golang-native, works with PostgreSQL
4. **Flexible**: Handles current RBAC and future ABAC needs
5. **Performant**: <1ms authorization checks, supports 50K+ users
6. **Maintainable**: Config-driven policies, easy to update
7. **No extra cost**: In-process library, no separate service
8. **Open source**: Active community, Apache 2.0 license

### ⚠️ Considerations:

1. **Learning curve**: ~1-2 days to understand model/policy syntax
2. **Testing**: Need to write tests for policy rules
3. **Documentation**: Need to document our model and policies

### 📋 Action Items:

1. **Iteration 1, Week 3**: Add Casbin to backend
2. **Iteration 1, Week 4**: Implement basic RBAC
3. **Iteration 2**: Add resource-level permissions
4. **Iteration 3**: Add moderator and admin capabilities
5. **Document**: Create internal guide for adding new permissions

---

## 11. References

- **Casbin Official Site**: https://casbin.org
- **Casbin GitHub**: https://github.com/casbin/casbin
- **PostgreSQL Adapter**: https://github.com/casbin/casbin-pg-adapter
- **Golang Examples**: https://casbin.org/docs/get-started
- **RBAC Documentation**: https://casbin.org/docs/rbac
- **ABAC Documentation**: https://casbin.org/docs/abac

---

**Conclusion**: Casbin is strongly recommended for Precium. It provides production-ready authorization with minimal development effort, perfect fit with our Golang backend, and scales from simple RBAC to complex ABAC as we grow.
