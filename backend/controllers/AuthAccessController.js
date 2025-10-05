const { userAccessModel } = require("../models");

const AuthAccessController = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await userAccessModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        
        // In a real application, you should hash passwords and compare hashed values
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }
        
        return res.status(200).json({ 
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (err) {
        console.error('AuthAccessController error:', err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { AuthAccessController };
