import mongoose from 'mongoose';

const userAccessSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 15,
        match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        message: "Password must be atleast least 8 character with one uppercase,lowercase,special character and the number"
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "super-admin", "mediator", "purchaser", "supplier", "customer", "individual"],
        default: "individual",
        message: "Role must be one of the following: admin, super-admin, mediator, purchaser, supplier, customer, individual"
    },
    createdAt: {
        type: DateTime,
        default: Date.now()
    },
    updatedAt: {
        type: DateTime,
        default: Date.now(),
        onUpdate: Date.now()
    }
})

userAccessSchema.pre('save', function (next) {
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

export default userAccessModel;