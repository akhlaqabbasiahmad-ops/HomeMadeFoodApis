import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';
import { FoodItemEntity } from '../entities/food-item.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Order } from '../entities/order.entity';
import { RestaurantEntity } from '../entities/restaurant.entity';
import { UserEntity } from '../entities/user.entity';

export class DatabaseSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    await this.seedCategories();
    await this.seedUsers();
    await this.seedRestaurants();
    await this.seedFoodItems();
    await this.seedOrders();

    console.log('✅ Database seeding completed!');
  }

  private async seedCategories(): Promise<void> {
    const categoryRepository = this.dataSource.getRepository(Category);
    
    const categories = [
      { name: 'Italian', description: 'Traditional Italian cuisine', icon: 'restaurant' },
      { name: 'Asian', description: 'Asian fusion and traditional dishes', icon: 'leaf' },
      { name: 'Mexican', description: 'Authentic Mexican food', icon: 'flame' },
      { name: 'American', description: 'Classic American dishes', icon: 'fast-food' },
      { name: 'Pizza', description: 'Fresh baked pizzas', icon: 'pizza' },
      { name: 'Desserts', description: 'Sweet treats and desserts', icon: 'ice-cream' },
      { name: 'Beverages', description: 'Drinks and beverages', icon: 'wine' },
      { name: 'Indian', description: 'Spicy and flavorful Indian cuisine', icon: 'flame' },
      { name: 'Mediterranean', description: 'Healthy Mediterranean dishes', icon: 'leaf' },
      { name: 'Chinese', description: 'Traditional Chinese cuisine', icon: 'restaurant' },
    ];

    for (const categoryData of categories) {
      const existingCategory = await categoryRepository.findOne({
        where: { name: categoryData.name }
      });

      if (!existingCategory) {
        const category = categoryRepository.create(categoryData);
        await categoryRepository.save(category);
        console.log(`Created category: ${categoryData.name}`);
      }
    }
  }

  private async seedUsers(): Promise<void> {
    const userRepository = this.dataSource.getRepository(UserEntity);

        const users = [
          {
            email: 'admin@homemadefood.com',
            password: await bcrypt.hash('admin123', 10),
            name: 'Admin User',
            phone: '+1234567890',
            role: 'admin',
          },
          {
            email: 'customer@example.com',
            password: await bcrypt.hash('customer123', 10),
            name: 'John Doe',
            phone: '+1987654321',
            role: 'user',
          },
          {
            email: 'restaurant@example.com',
            password: await bcrypt.hash('restaurant123', 10),
            name: 'Restaurant Owner',
            phone: '+1122334455',
            role: 'user',
          },
        ];

    for (const userData of users) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const user = userRepository.create(userData);
        await userRepository.save(user);
        console.log(`Created user: ${userData.email}`);
      }
    }
  }

  private async seedRestaurants(): Promise<void> {
    const restaurantRepository = this.dataSource.getRepository(RestaurantEntity);
    const userRepository = this.dataSource.getRepository(UserEntity);

    const restaurantOwner = await userRepository.findOne({
      where: { email: 'restaurant@example.com' }
    });

    if (!restaurantOwner) {
      console.log('Restaurant owner not found, skipping restaurant seeding');
      return;
    }

    const restaurants = [
      {
        name: "Mario's Italian Kitchen",
        description: "Authentic Italian cuisine with traditional recipes passed down through generations",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
        rating: 4.5,
        reviews: 128,
        deliveryTime: "25-35 min",
        deliveryFee: 2.99,
        minimumOrder: 15.00,
        categories: ["Italian", "Pizza"],
        isOpen: true,
        distance: 2.5,
        latitude: 40.7128,
        longitude: -74.0060,
        ownerId: restaurantOwner.id,
      },
      {
        name: "Dragon Palace",
        description: "Premium Chinese cuisine with modern twist",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        rating: 4.3,
        reviews: 95,
        deliveryTime: "30-40 min",
        deliveryFee: 3.49,
        minimumOrder: 20.00,
        categories: ["Chinese", "Asian"],
        isOpen: true,
        distance: 3.2,
        latitude: 40.7589,
        longitude: -73.9851,
        ownerId: restaurantOwner.id,
      },
      {
        name: "Taco Fiesta",
        description: "Fresh Mexican street food and traditional dishes",
        image: "https://images.unsplash.com/photo-1565299585323-38174c13a7d4?w=800",
        rating: 4.2,
        reviews: 87,
        deliveryTime: "20-30 min",
        deliveryFee: 2.49,
        minimumOrder: 12.00,
        categories: ["Mexican"],
        isOpen: true,
        distance: 1.8,
        latitude: 40.7505,
        longitude: -73.9934,
        ownerId: restaurantOwner.id,
      },
      {
        name: "Burger Junction",
        description: "Gourmet burgers and classic American comfort food",
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800",
        rating: 4.1,
        reviews: 112,
        deliveryTime: "15-25 min",
        deliveryFee: 2.99,
        minimumOrder: 10.00,
        categories: ["American"],
        isOpen: true,
        distance: 1.2,
        latitude: 40.7282,
        longitude: -73.7949,
        ownerId: restaurantOwner.id,
      },
    ];

    for (const restaurantData of restaurants) {
      const existingRestaurant = await restaurantRepository.findOne({
        where: { name: restaurantData.name }
      });

      if (!existingRestaurant) {
        const restaurant = restaurantRepository.create(restaurantData);
        await restaurantRepository.save(restaurant);
        console.log(`Created restaurant: ${restaurantData.name}`);
      }
    }
  }

  private async seedFoodItems(): Promise<void> {
    const foodItemRepository = this.dataSource.getRepository(FoodItemEntity);
    const restaurantRepository = this.dataSource.getRepository(RestaurantEntity);
    const categoryRepository = this.dataSource.getRepository(Category);

    const restaurants = await restaurantRepository.find();
    const categories = await categoryRepository.find();

    if (restaurants.length === 0 || categories.length === 0) {
      console.log('No restaurants or categories found, skipping food items seeding');
      return;
    }

    const mariosRestaurant = restaurants.find(r => r.name.includes("Mario's"));
    const dragonPalace = restaurants.find(r => r.name.includes("Dragon"));
    const tacoFiesta = restaurants.find(r => r.name.includes("Taco"));
    const burgerJunction = restaurants.find(r => r.name.includes("Burger"));

    const italianCategory = categories.find(c => c.name === 'Italian');
    const chineseCategory = categories.find(c => c.name === 'Chinese');
    const mexicanCategory = categories.find(c => c.name === 'Mexican');
    const americanCategory = categories.find(c => c.name === 'American');
    const pizzaCategory = categories.find(c => c.name === 'Pizza');
    const dessertsCategory = categories.find(c => c.name === 'Desserts');

    const foodItems = [
      // Mario's Italian Kitchen
      {
        name: "Spaghetti Carbonara",
        description: "Classic Italian pasta with eggs, cheese, pancetta, and black pepper",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800",
        price: 16.99,
        originalPrice: 19.99,
        rating: 4.6,
        reviews: 128,
        category: "Italian",
        restaurantId: mariosRestaurant?.id,
        restaurantName: mariosRestaurant?.name || "Mario's Italian Kitchen",
        ingredients: ["spaghetti", "eggs", "pecorino romano", "guanciale", "black pepper"],
        allergens: ["gluten", "dairy", "eggs"],
        isVegetarian: false,
        isVegan: false,
        isSpicy: false,
        preparationTime: 25,
        calories: 620,
        isFeatured: true,
        isPopular: false,
      },
      {
        name: "Margherita Pizza",
        description: "Fresh mozzarella, tomatoes, and basil on thin crust",
        image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800",
        price: 14.99,
        originalPrice: 17.99,
        rating: 4.5,
        reviews: 95,
        category: "Pizza",
        restaurantId: mariosRestaurant?.id,
        restaurantName: mariosRestaurant?.name || "Mario's Italian Kitchen",
        ingredients: ["pizza dough", "tomato sauce", "mozzarella", "fresh basil", "olive oil"],
        allergens: ["gluten", "dairy"],
        isVegetarian: true,
        isVegan: false,
        isSpicy: false,
        preparationTime: 20,
        calories: 540,
        isFeatured: false,
        isPopular: true,
      },
      {
        name: "Tiramisu",
        description: "Traditional Italian dessert with coffee-soaked ladyfingers and mascarpone",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800",
        price: 7.99,
        originalPrice: 9.99,
        rating: 4.8,
        reviews: 67,
        category: "Desserts",
        restaurantId: mariosRestaurant?.id,
        restaurantName: mariosRestaurant?.name || "Mario's Italian Kitchen",
        ingredients: ["ladyfingers", "mascarpone", "coffee", "cocoa powder", "eggs", "sugar"],
        allergens: ["gluten", "dairy", "eggs"],
        isVegetarian: true,
        isVegan: false,
        isSpicy: false,
        preparationTime: 10,
        calories: 340,
        isFeatured: false,
        isPopular: false,
      },

      // Dragon Palace
      {
        name: "Sweet and Sour Pork",
        description: "Crispy pork with pineapple, bell peppers in tangy sauce",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
        price: 18.99,
        originalPrice: 21.99,
        rating: 4.4,
        reviews: 82,
        category: "Chinese",
        restaurantId: dragonPalace?.id,
        restaurantName: dragonPalace?.name || "Dragon Palace",
        ingredients: ["pork", "pineapple", "bell peppers", "onion", "sweet and sour sauce"],
        allergens: ["soy"],
        isVegetarian: false,
        isVegan: false,
        isSpicy: false,
        preparationTime: 30,
        calories: 680,
        isFeatured: true,
        isPopular: false,
      },
      {
        name: "Kung Pao Chicken",
        description: "Spicy stir-fried chicken with peanuts and vegetables",
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800",
        price: 17.99,
        originalPrice: 20.99,
        rating: 4.3,
        reviews: 94,
        category: "Chinese",
        restaurantId: dragonPalace?.id,
        restaurantName: dragonPalace?.name || "Dragon Palace",
        ingredients: ["chicken", "peanuts", "bell peppers", "dried chilies", "soy sauce"],
        allergens: ["soy", "peanuts"],
        isVegetarian: false,
        isVegan: false,
        isSpicy: true,
        preparationTime: 25,
        calories: 580,
        isFeatured: false,
        isPopular: true,
      },

      // Taco Fiesta
      {
        name: "Carnitas Tacos",
        description: "Slow-cooked pork with onions, cilantro, and salsa verde (3 tacos)",
        image: "https://images.unsplash.com/photo-1565299585323-38174c13a7d4?w=800",
        price: 12.99,
        originalPrice: 14.99,
        rating: 4.5,
        reviews: 156,
        category: "Mexican",
        restaurantId: tacoFiesta?.id,
        restaurantName: tacoFiesta?.name || "Taco Fiesta",
        ingredients: ["pork shoulder", "corn tortillas", "onion", "cilantro", "salsa verde"],
        allergens: ["gluten"],
        isVegetarian: false,
        isVegan: false,
        isSpicy: false,
        preparationTime: 15,
        calories: 480,
        isFeatured: false,
        isPopular: true,
      },
      {
        name: "Guacamole & Chips",
        description: "Fresh avocado dip with tortilla chips",
        image: "https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=800",
        price: 8.99,
        originalPrice: 10.99,
        rating: 4.2,
        reviews: 73,
        category: "Mexican",
        restaurantId: tacoFiesta?.id,
        restaurantName: tacoFiesta?.name || "Taco Fiesta",
        ingredients: ["avocado", "lime", "onion", "cilantro", "tortilla chips"],
        allergens: [],
        isVegetarian: true,
        isVegan: true,
        isSpicy: false,
        preparationTime: 10,
        calories: 320,
        isFeatured: false,
        isPopular: false,
      },

      // Burger Junction
      {
        name: "Classic Cheeseburger",
        description: "Beef patty with cheddar cheese, lettuce, tomato, onion",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
        price: 13.99,
        originalPrice: 15.99,
        rating: 4.3,
        reviews: 112,
        category: "American",
        restaurantId: burgerJunction?.id,
        restaurantName: burgerJunction?.name || "Burger Junction",
        ingredients: ["beef patty", "cheddar cheese", "lettuce", "tomato", "onion", "burger bun"],
        allergens: ["gluten", "dairy"],
        isVegetarian: false,
        isVegan: false,
        isSpicy: false,
        preparationTime: 20,
        calories: 650,
        isFeatured: true,
        isPopular: false,
      },
      {
        name: "Crispy Chicken Wings",
        description: "Buffalo wings served with celery and blue cheese dip",
        image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800",
        price: 11.99,
        originalPrice: 13.99,
        rating: 4.1,
        reviews: 89,
        category: "American",
        restaurantId: burgerJunction?.id,
        restaurantName: burgerJunction?.name || "Burger Junction",
        ingredients: ["chicken wings", "buffalo sauce", "celery", "blue cheese dip"],
        allergens: ["dairy"],
        isVegetarian: false,
        isVegan: false,
        isSpicy: true,
        preparationTime: 25,
        calories: 580,
        isFeatured: false,
        isPopular: true,
      },
    ];

    for (const itemData of foodItems) {
      if (!itemData.restaurantId) continue;

      const existingItem = await foodItemRepository.findOne({
        where: { 
          name: itemData.name,
          restaurantId: itemData.restaurantId 
        }
      });

      if (!existingItem) {
        const foodItem = foodItemRepository.create(itemData);
        await foodItemRepository.save(foodItem);
        console.log(`Created food item: ${itemData.name}`);
      }
    }
  }

  private async seedOrders(): Promise<void> {
    const orderRepository = this.dataSource.getRepository(Order);
    const orderItemRepository = this.dataSource.getRepository(OrderItem);
    const userRepository = this.dataSource.getRepository(UserEntity);
    const foodItemRepository = this.dataSource.getRepository(FoodItemEntity);
    const restaurantRepository = this.dataSource.getRepository(RestaurantEntity);

    // Get customer user
    const customer = await userRepository.findOne({
      where: { email: 'customer@example.com' }
    });

    if (!customer) {
      console.log('Customer user not found, skipping order seeding');
      return;
    }

    // Get restaurants and food items
    const restaurants = await restaurantRepository.find();
    const foodItems = await foodItemRepository.find();

    if (restaurants.length === 0 || foodItems.length === 0) {
      console.log('No restaurants or food items found, skipping order seeding');
      return;
    }

    const mariosRestaurant = restaurants.find(r => r.name.includes("Mario's"));
    const dragonPalace = restaurants.find(r => r.name.includes("Dragon"));
    const tacoFiesta = restaurants.find(r => r.name.includes("Taco"));
    const burgerJunction = restaurants.find(r => r.name.includes("Burger"));

    // Create sample orders
    const orders = [
      {
        userId: customer.id,
        restaurantId: mariosRestaurant?.id,
        restaurantName: mariosRestaurant?.name,
        totalAmount: 24.98,
        deliveryFee: 2.99,
        tax: 2.25,
        grandTotal: 30.22,
        status: 'delivered',
        deliveryAddress: {
          title: 'Home',
          address: '123 Main Street, Downtown, City 12345',
          latitude: 40.7128,
          longitude: -74.0060,
        },
        paymentMethod: 'Credit Card',
        orderDate: new Date('2024-01-15T18:30:00'),
        estimatedDeliveryTime: new Date('2024-01-15T19:00:00'),
        actualDeliveryTime: new Date('2024-01-15T19:05:00'),
        trackingId: 'ORD-001',
        specialInstructions: 'Please ring the doorbell',
        items: [
          {
            foodItemId: foodItems.find(f => f.name === "Spaghetti Carbonara")?.id,
            name: "Spaghetti Carbonara",
            image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800",
            price: 16.99,
            quantity: 1,
            totalPrice: 16.99,
            specialInstructions: 'Extra cheese',
          },
          {
            foodItemId: foodItems.find(f => f.name === "Tiramisu")?.id,
            name: "Tiramisu",
            image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800",
            price: 7.99,
            quantity: 1,
            totalPrice: 7.99,
          },
        ],
      },
      {
        userId: customer.id,
        restaurantId: dragonPalace?.id,
        restaurantName: dragonPalace?.name,
        totalAmount: 36.98,
        deliveryFee: 3.49,
        tax: 3.24,
        grandTotal: 43.71,
        status: 'preparing',
        deliveryAddress: {
          title: 'Work',
          address: '456 Business Ave, Corporate District, City 67890',
          latitude: 40.7589,
          longitude: -73.9851,
        },
        paymentMethod: 'Cash on Delivery',
        orderDate: new Date(),
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000),
        trackingId: 'ORD-002',
        specialInstructions: 'Call when you arrive',
        items: [
          {
            foodItemId: foodItems.find(f => f.name === "Sweet and Sour Pork")?.id,
            name: "Sweet and Sour Pork",
            image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
            price: 18.99,
            quantity: 1,
            totalPrice: 18.99,
          },
          {
            foodItemId: foodItems.find(f => f.name === "Kung Pao Chicken")?.id,
            name: "Kung Pao Chicken",
            image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800",
            price: 17.99,
            quantity: 1,
            totalPrice: 17.99,
          },
        ],
      },
      {
        userId: customer.id,
        restaurantId: tacoFiesta?.id,
        restaurantName: tacoFiesta?.name,
        totalAmount: 21.98,
        deliveryFee: 2.49,
        tax: 1.95,
        grandTotal: 26.42,
        status: 'confirmed',
        deliveryAddress: {
          title: 'Home',
          address: '123 Main Street, Downtown, City 12345',
          latitude: 40.7128,
          longitude: -74.0060,
        },
        paymentMethod: 'Credit Card',
        orderDate: new Date(Date.now() - 10 * 60 * 1000),
        estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000),
        trackingId: 'ORD-003',
        items: [
          {
            foodItemId: foodItems.find(f => f.name === "Carnitas Tacos")?.id,
            name: "Carnitas Tacos",
            image: "https://images.unsplash.com/photo-1565299585323-38174c13a7d4?w=800",
            price: 12.99,
            quantity: 1,
            totalPrice: 12.99,
          },
          {
            foodItemId: foodItems.find(f => f.name === "Guacamole & Chips")?.id,
            name: "Guacamole & Chips",
            image: "https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=800",
            price: 8.99,
            quantity: 1,
            totalPrice: 8.99,
          },
        ],
      },
      {
        userId: customer.id,
        restaurantId: burgerJunction?.id,
        restaurantName: burgerJunction?.name,
        totalAmount: 25.98,
        deliveryFee: 2.99,
        tax: 2.31,
        grandTotal: 31.28,
        status: 'pending',
        deliveryAddress: {
          title: 'Office',
          address: '789 Corporate Blvd, Business Park, City 54321',
          latitude: 40.7505,
          longitude: -73.9934,
        },
        paymentMethod: 'Credit Card',
        orderDate: new Date(Date.now() - 5 * 60 * 1000),
        estimatedDeliveryTime: new Date(Date.now() + 25 * 60 * 1000),
        trackingId: 'ORD-004',
        items: [
          {
            foodItemId: foodItems.find(f => f.name === "Classic Cheeseburger")?.id,
            name: "Classic Cheeseburger",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
            price: 13.99,
            quantity: 1,
            totalPrice: 13.99,
            specialInstructions: 'No onions',
          },
          {
            foodItemId: foodItems.find(f => f.name === "Crispy Chicken Wings")?.id,
            name: "Crispy Chicken Wings",
            image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800",
            price: 11.99,
            quantity: 1,
            totalPrice: 11.99,
            specialInstructions: 'Extra spicy',
          },
        ],
      },
    ];

    for (const orderData of orders) {
      // Check if order already exists
      const existingOrder = await orderRepository.findOne({
        where: { trackingId: orderData.trackingId }
      });

      if (existingOrder) {
        console.log(`Order ${orderData.trackingId} already exists, skipping`);
        continue;
      }

      // Create order
      const order = orderRepository.create({
        userId: orderData.userId,
        restaurantId: orderData.restaurantId,
        restaurantName: orderData.restaurantName,
        totalAmount: orderData.totalAmount,
        deliveryFee: orderData.deliveryFee,
        tax: orderData.tax,
        grandTotal: orderData.grandTotal,
        status: orderData.status,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        orderDate: orderData.orderDate,
        estimatedDeliveryTime: orderData.estimatedDeliveryTime,
        actualDeliveryTime: orderData.actualDeliveryTime,
        trackingId: orderData.trackingId,
        specialInstructions: orderData.specialInstructions,
      });

      const savedOrder = await orderRepository.save(order);
      console.log(`Created order: ${orderData.trackingId}`);

      // Create order items
      for (const itemData of orderData.items) {
        if (!itemData.foodItemId) continue;

        const orderItem = orderItemRepository.create({
          orderId: savedOrder.id,
          foodItemId: itemData.foodItemId,
          name: itemData.name,
          image: itemData.image,
          price: itemData.price,
          quantity: itemData.quantity,
          totalPrice: itemData.totalPrice,
          specialInstructions: (itemData as any).specialInstructions || null,
        });

        await orderItemRepository.save(orderItem);
        console.log(`Created order item: ${itemData.name}`);
      }
    }
  }
}