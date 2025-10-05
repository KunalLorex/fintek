const jwt = require('jsonwebtoken');
const { userAccessModel } = require("../models");

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error('Token verification error:', err);
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Middleware to check user roles
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Access denied. User not authenticated." });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }

        next();
    };
};

// Get current user profile
const getCurrentUser = async (req, res) => {
    try {
        const user = await userAccessModel.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    }
    catch (err) {
        console.error('Get current user error:', err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { email, role } = req.body;
        const userId = req.user.userId;

        const updateData = {};
        if (email) updateData.email = email;
        if (role) updateData.role = role;

        const user = await userAccessModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                updatedAt: user.updatedAt
            }
        });
    }
    catch (err) {
        console.error('Update profile error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Logout (client-side token removal)
const logoutUser = async (req, res) => {
    try {
        // In a more sophisticated setup, you might want to blacklist the token
        return res.status(200).json({ message: "Logged out successfully" });
    }
    catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    verifyToken,
    checkRole,
    getCurrentUser,
    updateUserProfile,
    logoutUser
};
