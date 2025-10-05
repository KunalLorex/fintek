# API Testing Guide

## Base URL
```
http://localhost:8001
```

## Sample API Requests

### 1. Test Server Connection
```bash
GET http://localhost:8001/api
```
**Expected Response:**
```json
{
  "values": "Hello World"
}
```

### 2. User Registration
```bash
POST http://localhost:8001/api/auth/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "Password123!",
  "role": "individual"
}
```
**Expected Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "john.doe@example.com",
    "role": "individual"
  }
}
```

### 3. User Login
```bash
POST http://localhost:8001/api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```
**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "john.doe@example.com",
    "role": "individual"
  }
}
```

### 4. Get User Profile (Protected Route)
```bash
GET http://localhost:8001/api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Expected Response:**
```json
{
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "john.doe@example.com",
    "role": "individual",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5. Update User Profile (Protected Route)
```bash
PUT http://localhost:8001/api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "email": "john.updated@example.com",
  "role": "customer"
}
```
**Expected Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "john.updated@example.com",
    "role": "customer",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

### 6. Logout (Protected Route)
```bash
POST http://localhost:8001/api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Expected Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Error Testing Examples

### 7. Invalid Registration (Missing Fields)
```bash
POST http://localhost:8001/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com"
}
```
**Expected Response:**
```json
{
  "message": "Email and password are required"
}
```

### 8. Invalid Login (Wrong Password)
```bash
POST http://localhost:8001/api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "WrongPassword123!"
}
```
**Expected Response:**
```json
{
  "message": "Invalid credentials"
}
```

### 9. Access Protected Route Without Token
```bash
GET http://localhost:8001/api/auth/profile
```
**Expected Response:**
```json
{
  "message": "Access denied. No token provided."
}
```

### 10. Access Protected Route With Invalid Token
```bash
GET http://localhost:8001/api/auth/profile
Authorization: Bearer invalid-token
```
**Expected Response:**
```json
{
  "message": "Invalid token"
}
```

## Testing with cURL Commands

### Register User
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "role": "individual"
  }'
```

### Login User
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### Get Profile (Replace TOKEN with actual token)
```bash
curl -X GET http://localhost:8001/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## Testing with Postman

1. **Create a new collection** called "Fintek API Tests"
2. **Set base URL** to `http://localhost:8001`
3. **Create environment variables:**
   - `base_url`: `http://localhost:8001`
   - `token`: (will be set after login)

4. **For protected routes:**
   - Go to Authorization tab
   - Select "Bearer Token"
   - Use the token from login response

## Password Requirements

When testing registration, ensure passwords meet these requirements:
- Minimum 8 characters
- Maximum 15 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

**Valid password examples:**
- `Password123!`
- `MyPass456@`
- `TestPass789$`

## Available User Roles

- `admin`
- `super-admin`
- `mediator`
- `purchaser`
- `supplier`
- `customer`
- `individual` (default)
