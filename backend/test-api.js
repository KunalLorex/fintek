const axios = require('axios');

const BASE_URL = 'http://localhost:8001';
let authToken = '';

// Test functions
async function testServerConnection() {
    try {
        console.log('🔍 Testing server connection...');
        const response = await axios.get(`${BASE_URL}/api`);
        console.log('✅ Server is running:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Server connection failed:', error.message);
        return false;
    }
}

async function testUserRegistration() {
    try {
        console.log('\n🔍 Testing user registration...');
        const userData = {
            email: 'test@example.com',
            password: 'Password123!',
            role: 'individual'
        };
        
        const response = await axios.post(`${BASE_URL}/api/auth/register`, userData);
        console.log('✅ User registered successfully:', response.data);
        return response.data.token;
    } catch (error) {
        console.log('❌ Registration failed:', error.response?.data || error.message);
        return null;
    }
}

async function testUserLogin() {
    try {
        console.log('\n🔍 Testing user login...');
        const loginData = {
            email: 'test@example.com',
            password: 'Password123!'
        };
        
        const response = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
        console.log('✅ Login successful:', response.data);
        return response.data.token;
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data || error.message);
        return null;
    }
}

async function testGetProfile(token) {
    try {
        console.log('\n🔍 Testing get profile...');
        const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Profile retrieved:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Get profile failed:', error.response?.data || error.message);
        return false;
    }
}

async function testUpdateProfile(token) {
    try {
        console.log('\n🔍 Testing update profile...');
        const updateData = {
            role: 'customer'
        };
        
        const response = await axios.put(`${BASE_URL}/api/auth/profile`, updateData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Profile updated:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Update profile failed:', error.response?.data || error.message);
        return false;
    }
}

async function testLogout(token) {
    try {
        console.log('\n🔍 Testing logout...');
        const response = await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Logout successful:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Logout failed:', error.response?.data || error.message);
        return false;
    }
}

async function testErrorCases() {
    console.log('\n🔍 Testing error cases...');
    
    // Test invalid login
    try {
        await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'test@example.com',
            password: 'WrongPassword123!'
        });
        console.log('❌ Should have failed with wrong password');
    } catch (error) {
        console.log('✅ Correctly rejected invalid credentials:', error.response?.data?.message);
    }
    
    // Test access without token
    try {
        await axios.get(`${BASE_URL}/api/auth/profile`);
        console.log('❌ Should have failed without token');
    } catch (error) {
        console.log('✅ Correctly rejected request without token:', error.response?.data?.message);
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting API Tests...\n');
    
    // Test server connection
    const serverRunning = await testServerConnection();
    if (!serverRunning) {
        console.log('❌ Server is not running. Please start the server with: npm start');
        return;
    }
    
    // Test registration
    let token = await testUserRegistration();
    
    // If registration failed, try login (user might already exist)
    if (!token) {
        console.log('📝 Registration failed, trying login...');
        token = await testUserLogin();
    }
    
    if (!token) {
        console.log('❌ Could not get authentication token. Tests cannot continue.');
        return;
    }
    
    authToken = token;
    
    // Test protected routes
    await testGetProfile(authToken);
    await testUpdateProfile(authToken);
    await testLogout(authToken);
    
    // Test error cases
    await testErrorCases();
    
    console.log('\n🎉 All tests completed!');
}

// Run tests
runTests().catch(console.error);
