# Fintek Backend API

A Node.js/Express backend API with MongoDB for user authentication and management.

## Features

- User registration and authentication
- JWT token-based authentication
- Role-based access control
- Password hashing with bcrypt
- MongoDB integration with Mongoose
- Input validation
- Error handling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/fintek
PORT=8001
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

3. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Public Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/login` - Legacy login route

#### Protected Routes (require Authorization header with Bearer token)
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

### Request/Response Examples

#### Register User
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "Password123!",
  "role": "individual"
}
```

#### Login User
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

#### Get Profile (requires Authorization header)
```
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

## User Roles

- `admin` - Administrator
- `super-admin` - Super Administrator
- `mediator` - Mediator
- `purchaser` - Purchaser
- `supplier` - Supplier
- `customer` - Customer
- `individual` - Individual (default)

## Password Requirements

- Minimum 8 characters
- Maximum 15 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

## Database Schema

### UserAccess Model
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `role` (String, required, enum)
- `createdAt` (Date)
- `updatedAt` (Date)

in the respective .env file correct the password for the mongourl
