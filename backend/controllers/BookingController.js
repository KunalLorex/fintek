const mongoose = require('mongoose');
const { Theatre } = require('../models');
const Movie = require('../models/movie');
const Show = require('../models/show');
const Booking = require('../models/booking');

// Utility to compute price
function computeSeatPrice(baseSeatPrice, seatTypeMultipliers, seatType) {
    const multiplier = seatTypeMultipliers?.[seatType] ?? 1.0;
    return Math.round(baseSeatPrice * multiplier);
}

// POST /api/booking/book
// Body: { theatreId, screenId, showId, movieId, seats: [{ seatId, seatType }], userId }
async function holdSeats(req, res, next) {
    try {
        const { theatreId, screenId, showId, movieId, seats = [], userId } = req.body;
        if (!theatreId || !screenId || !showId || !movieId || !Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const theatre = await Theatre.findById(theatreId);
        if (!theatre) return res.status(404).json({ message: 'Theatre not found' });
        const screen = theatre.screens.id(screenId);
        if (!screen) return res.status(404).json({ message: 'Screen not found' });

        const show = await Show.findById(showId);
        if (!show) return res.status(404).json({ message: 'Show not found' });
        if (String(show.theatreId) !== String(theatreId) || String(show.screenId) !== String(screenId) || String(show.movieId) !== String(movieId)) {
            return res.status(400).json({ message: 'Show does not match theatre/screen/movie' });
        }

        const movie = await Movie.findById(movieId);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });

        // Validate seats exist and types match
        const validSeatIds = new Set(screen.seatMap.map(s => s.seatId));
        const seatIdToType = new Map(screen.seatMap.map(s => [s.seatId, s.type]));
        for (const seat of seats) {
            if (!validSeatIds.has(seat.seatId)) {
                return res.status(400).json({ message: `Seat ${seat.seatId} not found in screen` });
            }
            const expectedType = seatIdToType.get(seat.seatId);
            if (expectedType !== seat.seatType) {
                return res.status(400).json({ message: `Seat ${seat.seatId} type mismatch` });
            }
        }

        // Ensure seats are not already held/confirmed and unexpired holds
        const now = new Date();
        const conflicting = await Booking.findOne({
            showId,
            status: { $in: ['HELD', 'CONFIRMED'] },
            'seats.seatId': { $in: seats.map(s => s.seatId) },
            $or: [
                { status: 'CONFIRMED' },
                { status: 'HELD', holdExpiresAt: { $gt: now } }
            ]
        });
        if (conflicting) {
            return res.status(409).json({ message: 'One or more seats already held or booked' });
        }

        const holdExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        const seatTypeMultipliers = show.seatTypeMultipliers || {};
        const pricedSeats = seats.map(s => ({
            seatId: s.seatId,
            seatType: s.seatType,
            price: computeSeatPrice(movie.baseSeatPrice || 1, seatTypeMultipliers, s.seatType)
        }));
        const totalAmount = pricedSeats.reduce((sum, s) => sum + s.price, 0);

        const booking = await Booking.create({
            theatreId, screenId, showId, movieId, userId: userId || undefined,
            seats: pricedSeats,
            status: 'HELD',
            holdExpiresAt,
            totalAmount
        });

        return res.status(201).json({
            message: 'Seats held for 5 minutes',
            bookingId: booking._id,
            holdExpiresAt: booking.holdExpiresAt,
            totalAmount: booking.totalAmount
        });
    } catch (err) {
        next(err);
    }
}

// POST /api/booking/pay
// Body: { bookingId }
async function confirmBooking(req, res, next) {
    try {
        const { bookingId } = req.body;
        if (!bookingId) return res.status(400).json({ message: 'bookingId required' });

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.status === 'CONFIRMED') return res.status(200).json({ message: 'Already confirmed', bookingId });
        if (booking.status !== 'HELD') return res.status(400).json({ message: 'Booking not in HELD state' });
        if (booking.holdExpiresAt <= new Date()) return res.status(410).json({ message: 'Hold expired' });

        // Re-check no conflicts (idempotency/safety)
        const conflict = await Booking.findOne({
            _id: { $ne: booking._id },
            showId: booking.showId,
            status: 'CONFIRMED',
            'seats.seatId': { $in: booking.seats.map(s => s.seatId) }
        });
        if (conflict) return res.status(409).json({ message: 'Seats already booked' });

        booking.status = 'CONFIRMED';
        await booking.save();

        return res.status(200).json({ message: 'Booking confirmed', bookingId: booking._id });
    } catch (err) {
        next(err);
    }
}

// GET /api/booking/getbooking/:id
async function getBooking(req, res, next) {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id)
            .populate('theatreId')
            .populate('movieId')
            .populate('showId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        return res.status(200).json({
            booking: {
                id: booking._id,
                status: booking.status,
                theatre: booking.theatreId,
                screenId: booking.screenId,
                show: booking.showId,
                movie: booking.movieId,
                seats: booking.seats,
                totalAmount: booking.totalAmount,
                holdExpiresAt: booking.holdExpiresAt
            }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    holdSeats,
    confirmBooking,
    getBooking
};

