const mongoose = require('mongoose');
const { Schema } = mongoose;

const ShowSchema = new Schema({
    theatreId: { type: Schema.Types.ObjectId, ref: 'Theatre', required: true, index: true },
    screenId: { type: Schema.Types.ObjectId, required: true, index: true }, // references Theatre.screens._id
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    // Optional per-seat-type price multipliers overriding Movie.baseSeatPrice
    seatTypeMultipliers: {
        NORMAL: { type: Number, default: 1.0 },
        PREMIUM: { type: Number, default: 1.25 },
        LUXURY: { type: Number, default: 1.5 },
        RECLINER: { type: Number, default: 2.0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Show', ShowSchema);

