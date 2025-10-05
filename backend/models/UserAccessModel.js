const mongoose = require('mongoose');

const userAccessSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // If password is already hashed (starts with $2a$), don't validate format
                if (v.startsWith('$2a$')) {
                    return true;
                }
                // Validate original password format before hashing
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(v);
            },
            message: "Password must be 8-15 characters with one uppercase, lowercase, special character and number"
        }
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "super-admin", "mediator", "purchaser", "supplier", "customer", "individual"],
        default: "individual"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

userAccessSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (and is not already hashed)
    if (this.isModified('password') && !this.password.startsWith('$2a$')) {
        const bcrypt = require('bcryptjs');
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    
    if (!this.createdAt) {
        this.createdAt = Date.now()
    }
    this.updatedAt = Date.now();
    next();
}
)


userAccessSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

const userAccessModel = mongoose.model('UserAccess', userAccessSchema);

module.exports = userAccessModel;