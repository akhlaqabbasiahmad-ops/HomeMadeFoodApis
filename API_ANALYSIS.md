# HomeMadeFood Backend API Analysis

## 📊 API Endpoints Overview

### Base URL
All APIs are prefixed with `/api/v1`

---

## 🍕 Food Endpoints (`/api/v1/food`)

### Public Endpoints

| Method | Endpoint | Description | Auth Required | Status Filter | Issues Found |
|--------|----------|-------------|---------------|---------------|--------------|
| `GET` | `/food` | Search food items | ❌ No | ✅ `isAvailable=true` | ✅ Fixed - Now returns all available items when no query |
| `GET` | `/food/categories` | Get all food categories | ❌ No | ✅ `isActive=true` | ✅ Working correctly |
| `GET` | `/food/featured` | Get featured food items | ❌ No | ❌ No `isAvailable` filter | ⚠️ **ISSUE: Missing `isAvailable` filter** |
| `GET` | `/food/popular` | Get popular food items | ❌ No | ❌ No `isAvailable` filter | ⚠️ **ISSUE: Missing `isAvailable` filter** |
| `GET` | `/food/restaurant/:restaurantId` | Get food items by restaurant | ❌ No | ❌ No `isAvailable` filter | ⚠️ **ISSUE: Missing `isAvailable` filter** |
| `GET` | `/food/:id` | Get food item by ID | ❌ No | ❌ No filters | ⚠️ **ISSUE: Should check `isAvailable`** |

### Protected Endpoints (Require JWT)

| Method | Endpoint | Description | Auth Required | Issues Found |
|--------|----------|-------------|---------------|--------------|
| `POST` | `/food` | Create food item | ✅ Yes | ⚠️ **ISSUE: Uses `req.user.restaurantId` which may not exist** |
| `PATCH` | `/food/:id` | Update food item | ✅ Yes | ⚠️ **ISSUE: No authorization check (anyone can update any food)** |
| `DELETE` | `/food/:id` | Delete food item | ✅ Yes | ⚠️ **ISSUE: No authorization check** |

---

## 🔐 Authentication Endpoints (`/api/v1/auth`)

### Public Endpoints

| Method | Endpoint | Description | Auth Required | Status |
|--------|----------|-------------|---------------|--------|
| `POST` | `/auth/register` | Register new user | ❌ No | ✅ Working |
| `POST` | `/auth/login` | User login | ❌ No | ✅ Working |
| `POST` | `/auth/refresh` | Refresh access token | ❌ No | ✅ Working |

### Protected Endpoints

| Method | Endpoint | Description | Auth Required | Status |
|--------|----------|-------------|---------------|--------|
| `GET` | `/auth/profile` | Get user profile | ✅ Yes | ✅ Working |
| `PUT` | `/auth/change-password` | Change password | ✅ Yes | ✅ Working |
| `POST` | `/auth/logout` | Logout user | ✅ Yes | ⚠️ **Mock implementation - doesn't blacklist token** |

---

## 👥 User Endpoints (`/api/v1/users`)

### Public Endpoints

| Method | Endpoint | Description | Auth Required | Status |
|--------|----------|-------------|---------------|--------|
| `POST` | `/users` | Create new user | ❌ No | ✅ Working |

### Protected Endpoints

| Method | Endpoint | Description | Auth Required | Status |
|--------|----------|-------------|---------------|--------|
| `GET` | `/users` | Get all users (paged) | ✅ Yes | ⚠️ **Should be admin-only** |
| `GET` | `/users/profile` | Get current user profile | ✅ Yes | ✅ Working |
| `GET` | `/users/:id` | Get user by ID | ✅ Yes | ⚠️ **No authorization check** |
| `PATCH` | `/users/:id` | Update user | ✅ Yes | ⚠️ **No authorization check - users can update others** |
| `DELETE` | `/users/:id` | Delete user | ✅ Yes | ⚠️ **No authorization check** |

---

## 🛒 Order Endpoints (`/api/v1/orders`)

**All endpoints require authentication**

| Method | Endpoint | Description | Auth Required | Status |
|--------|----------|-------------|---------------|--------|
| `GET` | `/orders/history` | Get user order history | ✅ Yes | ✅ Working |
| `GET` | `/orders/:id` | Get order by ID | ✅ Yes | ✅ Working |
| `POST` | `/orders` | Create new order | ✅ Yes | ✅ Working |
| `PUT` | `/orders/:id/status` | Update order status | ✅ Yes | ⚠️ **Mock implementation** |
| `PUT` | `/orders/:id/cancel` | Cancel order | ✅ Yes | ⚠️ **Mock implementation** |

---

## 👨‍💼 Admin Endpoints (`/api/v1/admin`)

**All endpoints require authentication**

### Food Management

| Method | Endpoint | Description | Auth Required | Issues Found |
|--------|----------|-------------|---------------|--------------|
| `POST` | `/admin/food` | Create food item | ✅ Yes | ⚠️ **No admin role check** |
| `GET` | `/admin/food` | Get all food items (paged) | ✅ Yes | ⚠️ **No admin role check, no filters** |
| `GET` | `/admin/food/:id` | Get food item by ID | ✅ Yes | ⚠️ **No admin role check** |
| `PATCH` | `/admin/food/:id` | Update food item | ✅ Yes | ⚠️ **No admin role check** |
| `DELETE` | `/admin/food/:id` | Delete food item | ✅ Yes | ⚠️ **No admin role check** |

### Category Management

| Method | Endpoint | Description | Auth Required | Issues Found |
|--------|----------|-------------|---------------|--------------|
| `POST` | `/admin/categories` | Create category | ✅ Yes | ⚠️ **No admin role check** |
| `GET` | `/admin/categories` | Get all categories | ✅ Yes | ⚠️ **No admin role check, returns all (no filter)** |

---

## 🍴 Restaurant Endpoints

### ⚠️ **MISSING RESTAURANT CONTROLLER!**

**Status:** ❌ **NO RESTAURANT ENDPOINTS EXIST**

The following restaurant operations are NOT available via API:

- ❌ Get all restaurants
- ❌ Get restaurant by ID
- ❌ Search restaurants
- ❌ Get restaurants by category
- ❌ Get nearby restaurants
- ❌ Get top-rated restaurants
- ❌ Get fast delivery restaurants
- ❌ Create restaurant (for owners)
- ❌ Update restaurant
- ❌ Delete restaurant
- ❌ Get restaurants by owner

**Note:** There is a `RestaurantModule` but it's empty. There's a `RestaurantEntity` in the database and a repository interface, but no service or controller implementation.

---

## 🔍 Issues Summary

### Critical Issues

1. **Missing Restaurant Controller** ⚠️
   - No endpoints to retrieve restaurants
   - Restaurant data exists in DB but can't be accessed via API
   - Need to create full restaurant API

2. **Missing Authorization Checks** ⚠️
   - Admin endpoints don't verify admin role
   - Users can update/delete other users
   - Food items can be updated/deleted by anyone with auth

3. **Missing Filters on Food Endpoints** ⚠️
   - `/food/featured` - doesn't filter by `isAvailable`
   - `/food/popular` - doesn't filter by `isAvailable`
   - `/food/restaurant/:restaurantId` - doesn't filter by `isAvailable`
   - `/food/:id` - doesn't check if item is available

4. **Incomplete Implementations** ⚠️
   - Order status update is mock
   - Order cancellation is mock
   - Logout doesn't blacklist tokens

### Medium Priority Issues

5. **User Endpoints Security** ⚠️
   - `/users` should be admin-only
   - Users can update/delete other users' accounts

6. **Admin Endpoint Security** ⚠️
   - No role-based access control
   - Any authenticated user can access admin endpoints

7. **Food Item Creation** ⚠️
   - Uses `req.user.restaurantId` which may not exist
   - No validation that user owns the restaurant

---

## ✅ Recent Fixes Applied

1. ✅ Fixed `/food` search endpoint to return all available items when no query
2. ✅ Fixed `/food/categories` to filter by `isActive=true`
3. ✅ Removed all SQLite logic - now PostgreSQL only
4. ✅ Updated database configuration to always use PostgreSQL

---

## 📋 Recommended Next Steps

### High Priority

1. **Create Restaurant Controller & Service**
   - Implement all CRUD operations
   - Add search, filter, and location-based queries
   - Filter by `isActive=true` for public endpoints

2. **Add Authorization Guards**
   - Create `AdminGuard` for admin endpoints
   - Add ownership checks for restaurant owners
   - Implement role-based access control

3. **Fix Food Endpoint Filters**
   - Add `isAvailable` filter to featured, popular, and restaurant endpoints
   - Add availability check to single food item endpoint

### Medium Priority

4. **Complete Order Implementation**
   - Implement real order status updates
   - Implement real order cancellation with business logic

5. **Improve Security**
   - Add user ownership checks
   - Implement token blacklisting for logout
   - Add rate limiting to sensitive endpoints

---

## 🔗 API Base URLs

- **Development:** `http://localhost:3000/api/v1`
- **Production:** `http://your-domain.com/api/v1`
- **Swagger Docs:** `http://localhost:3000/api/docs`

---

## 📝 Response Format

All endpoints return a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Error description"
}
```

---

## 🔒 Authentication

Protected endpoints require JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained from:
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`

---

*Last Updated: Based on current codebase analysis*
*Database: PostgreSQL only (SQLite removed)*
