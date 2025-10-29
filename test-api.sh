#!/bin/bash

# Test script for HomeMadeFood App Backend
# This script tests the admin functionality

echo "🧪 Testing HomeMadeFood App Backend"
echo "=================================="

BASE_URL="http://localhost:3000/api/v1"

# Test if server is running
echo "🔍 Checking if server is running..."
if curl -s "$BASE_URL" > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Please start it with: npm run start:dev"
    exit 1
fi

# Test admin endpoints
echo ""
echo "🔍 Testing admin endpoints..."

# Test create category
echo "📝 Testing create category..."
CATEGORY_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Category",
    "description": "A test category",
    "icon": "restaurant"
  }')

if echo "$CATEGORY_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Create category endpoint working"
else
    echo "❌ Create category endpoint failed"
    echo "Response: $CATEGORY_RESPONSE"
fi

# Test create food item
echo "📝 Testing create food item..."
FOOD_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/food" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Pizza",
    "description": "A delicious test pizza",
    "price": 12.99,
    "image": "https://example.com/pizza.jpg",
    "category": "Pizza",
    "restaurantId": "test-restaurant",
    "restaurantName": "Test Restaurant",
    "ingredients": ["dough", "cheese", "tomato"],
    "allergens": ["dairy", "gluten"],
    "isVegetarian": false,
    "isVegan": false,
    "isSpicy": false,
    "preparationTime": 20,
    "calories": 300,
    "isFeatured": false,
    "isPopular": false
  }')

if echo "$FOOD_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Create food item endpoint working"
else
    echo "❌ Create food item endpoint failed"
    echo "Response: $FOOD_RESPONSE"
fi

# Test get categories
echo "📝 Testing get categories..."
CATEGORIES_RESPONSE=$(curl -s "$BASE_URL/admin/categories")

if echo "$CATEGORIES_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Get categories endpoint working"
else
    echo "❌ Get categories endpoint failed"
    echo "Response: $CATEGORIES_RESPONSE"
fi

# Test get food items
echo "📝 Testing get food items..."
FOOD_ITEMS_RESPONSE=$(curl -s "$BASE_URL/admin/food")

if echo "$FOOD_ITEMS_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Get food items endpoint working"
else
    echo "❌ Get food items endpoint failed"
    echo "Response: $FOOD_ITEMS_RESPONSE"
fi

echo ""
echo "🎉 Testing complete!"
echo ""
echo "Note: Some endpoints may require authentication."
echo "For full testing, please use the frontend admin interface."
