const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookedSeatSchema = new Schema({
    seatId: { type: String, required: true },
    seatType: { type: String, enum: ['NORMAL', 'PREMIUM', 'LUXURY', 'RECLINER'], required: true },
    price: { type: Number, required: true }
}, { _id: false });

const BookingSchema = new Schema({
    theatreId: { type: Schema.Types.ObjectId, ref: 'Theatre', required: true, index: true },
    screenId: { type: Schema.Types.ObjectId, required: true, index: true },
    showId: { type: Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'UserAccess' },
    seats: { type: [BookedSeatSchema], required: true },
    status: { type: String, enum: ['HELD', 'CONFIRMED', 'CANCELLED', 'EXPIRED'], default: 'HELD', index: true },
    holdExpiresAt: { type: Date, required: true, index: true },
    totalAmount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);

