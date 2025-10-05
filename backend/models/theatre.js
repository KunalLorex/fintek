const mongoose = require('mongoose');
const { Schema } = mongoose;

// Seat within a screen
const SeatSchema = new Schema({
    seatId: { type: String, required: true },
    row: { type: String, required: true },
    column: { type: Number, required: true },
    type: { type: String, enum: ['NORMAL', 'PREMIUM', 'LUXURY', 'RECLINER'], required: true }
}, { _id: true });

// Screen inside a theatre
const ScreenSchema = new Schema({
    name: { type: String, required: true },
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
    seatMap: { type: [SeatSchema], default: [] }
}, { _id: true });

// Theatre
const TheatreSchema = new Schema({
    name: { type: String, required: true, index: true },
    location: {
        address: { type: String }
    },
    screens: { type: [ScreenSchema], default: [] },
    ownerId: { type: Schema.Types.ObjectId, ref: 'TheatreOwner' }
}, { timestamps: true, _id: true });

module.exports = mongoose.model('Theatre', TheatreSchema);