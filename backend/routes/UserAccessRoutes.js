const { Router } = require('express');
const { 
    AuthAccessController, 
    registerUser, 
    loginUser, 
    verifyToken, 
    getCurrentUser, 
    updateUserProfile, 
    logoutUser 
} = require('../controllers');

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/login", AuthAccessController); // Legacy route

// Protected routes (require authentication)
router.get("/profile", verifyToken, getCurrentUser);
router.put("/profile", verifyToken, updateUserProfile);
router.post("/logout", verifyToken, logoutUser);

module.exports = router;