const { AuthAccessController } = require("./AuthAccessController");
const { registerUser, loginUser } = require("./AuthController");
const { verifyToken, checkRole, getCurrentUser, updateUserProfile, logoutUser } = require("./AuthVerifierController");

module.exports = {
    AuthAccessController,
    registerUser,
    loginUser,
    verifyToken,
    checkRole,
    getCurrentUser,
    updateUserProfile,
    logoutUser
};