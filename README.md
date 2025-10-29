# HomeMadeFood App - Backend

A NestJS backend API for the HomeMadeFood mobile application with clean architecture, PostgreSQL database, and admin functionality.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HomeMadeFoodApp/backend
   ```

2. **Run the setup script**
   
   **On Windows (PowerShell):**
   ```powershell
   .\setup.ps1
   ```
   
   **On macOS/Linux:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Start the development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── application/          # Use cases and DTOs
│   │   ├── dto/             # Data Transfer Objects
│   │   └── use-cases/       # Business logic
│   ├── domain/              # Domain entities and interfaces
│   │   ├── entities/        # Domain entities
│   │   ├── interfaces/      # Domain interfaces
│   │   └── repositories/    # Repository interfaces
│   ├── infrastructure/       # External concerns
│   │   ├── auth/           # Authentication strategies
│   │   ├── database/       # Database configuration and entities
│   │   └── repositories/   # Repository implementations
│   └── presentation/        # Controllers and modules
│       ├── controllers/    # API controllers
│       ├── guards/         # Auth guards
│       └── modules/       # Feature modules
├── scripts/                 # Database seeding scripts
├── docker-compose.dev.yml  # PostgreSQL development setup
└── package.json
```

## 🗄️ Database

### PostgreSQL Setup

The application uses PostgreSQL as the primary database. The development setup includes:

- **Host:** localhost
- **Port:** 5432
- **Database:** homemadefood_db
- **Username:** postgres
- **Password:** password

### Database Commands

```bash
# Start PostgreSQL
npm run db:start

# Stop PostgreSQL
npm run db:stop

# Reset database (removes all data)
npm run db:reset
```

## 🔐 Authentication

The API uses JWT-based authentication with the following endpoints:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh token
- `GET /auth/profile` - Get user profile

## 👨‍💼 Admin Features

Admin functionality is available at `/admin` endpoints:

### Food Management
- `POST /admin/food` - Create food item
- `GET /admin/food` - Get all food items
- `GET /admin/food/:id` - Get food item by ID
- `PATCH /admin/food/:id` - Update food item
- `DELETE /admin/food/:id` - Delete food item

### Category Management
- `POST /admin/categories` - Create category
- `GET /admin/categories` - Get all categories

## 📚 API Documentation

Once the server is running, you can access the Swagger API documentation at:
`http://localhost:3000/api`

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start development server
npm run start:debug        # Start with debugging

# Building
npm run build             # Build for production
npm run start:prod        # Start production server

# Database
npm run migration:generate # Generate migration
npm run migration:run     # Run migrations
npm run migration:revert  # Revert migration
npm run seed             # Seed database

# Testing
npm run test             # Run tests
npm run test:e2e        # Run e2e tests
npm run test:cov        # Run tests with coverage

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=homemadefood_db
DATABASE_SSL=false

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:19006

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Docker Deployment

```bash
# Build Docker image
docker build -t homemadefood-backend .

# Run container
docker run -p 3000:3000 homemadefood-backend
```

## 📝 API Endpoints

### Public Endpoints
- `GET /food` - Search food items
- `GET /food/categories` - Get categories
- `GET /food/featured` - Get featured items
- `GET /food/popular` - Get popular items
- `GET /food/:id` - Get food item by ID

### Authenticated Endpoints
- `POST /food` - Create food item (restaurant owner)
- `PATCH /food/:id` - Update food item
- `DELETE /food/:id` - Delete food item

### Admin Endpoints (Requires Admin Authentication)
- `POST /admin/food` - Create food item
- `GET /admin/food` - Get all food items
- `POST /admin/categories` - Create category
- `GET /admin/categories` - Get all categories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the logs: `npm run start:dev`
2. Verify database connection
3. Check environment variables
4. Review API documentation at `/api`

For additional support, please open an issue in the repository.