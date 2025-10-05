const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:8001';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fintek';

// Models (for seeding test data)
const { Theatre, Movie } = require('./models');
const Show = require('./models/show');
const Booking = require('./models/booking');

async function connectDb() {
    await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}

async function clearExistingTestData() {
    await Promise.all([
        Show.deleteMany({}),
        Booking.deleteMany({}),
        Movie.deleteMany({ title: { $in: ['mast Movie', 'mast Movie 2'] } }),
        Theatre.deleteMany({ name: { $in: ['Majedaar Theatre', 'Funplex Theatre'] } })
    ]);
}

async function seedData() {
    console.log('🧪 Seeding movie/theatre/show data...');

    const movie = await Movie.create({
        title: 'mast Movie',
        languages: ['EN'],
        genres: ['Drama'],
        runTimeMins: 120,
        rating: 8.1,
        baseSeatPrice: 150
    });

    const theatre1 = await Theatre.create({
        name: 'Majedaar Theatre',
        location: { address: '123 Majedaar Street' },
        screens: [
            {
                name: 'Screen 1',
                rows: 5,
                columns: 10,
                seatMap: [
                    { seatId: 'A1', row: 'A', column: 1, type: 'PREMIUM' },
                    { seatId: 'A2', row: 'A', column: 2, type: 'PREMIUM' },
                    { seatId: 'A3', row: 'A', column: 3, type: 'NORMAL' },
                    { seatId: 'A4', row: 'A', column: 4, type: 'RECLINER' },
                    { seatId: 'A5', row: 'A', column: 5, type: 'LUXURY' }
                ]
            },
            {
                name: 'Screen 2',
                rows: 5,
                columns: 10,
                seatMap: [
                    { seatId: 'A1', row: 'A', column: 1, type: 'PREMIUM' },
                    { seatId: 'A2', row: 'A', column: 2, type: 'PREMIUM' },
                    { seatId: 'B1', row: 'B', column: 1, type: 'NORMAL' },
                    { seatId: 'B2', row: 'B', column: 2, type: 'RECLINER' },
                    { seatId: 'B3', row: 'B', column: 3, type: 'LUXURY' }
                ]
            }
        ]
    });

    const theatre2 = await Theatre.create({
        name: 'Funplex Theatre',
        location: { address: '456 Fun Street' },
        screens: [
            {
                name: 'Main Screen',
                rows: 5,
                columns: 10,
                seatMap: [
                    { seatId: 'A1', row: 'A', column: 1, type: 'PREMIUM' },
                    { seatId: 'A2', row: 'A', column: 2, type: 'PREMIUM' },
                    { seatId: 'C1', row: 'C', column: 1, type: 'NORMAL' },
                    { seatId: 'C2', row: 'C', column: 2, type: 'RECLINER' },
                    { seatId: 'C3', row: 'C', column: 3, type: 'LUXURY' }
                ]
            }
        ]
    });

    const screen1Id = theatre1.screens[0]._id;
    const screen2Id = theatre1.screens[1]._id;
    const screenOtherId = theatre2.screens[0]._id;
    const startTime = new Date(Date.now() + 30 * 60 * 1000); // starts in 30 mins
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // +2 hours

    const show1 = await Show.create({
        theatreId: theatre1._id,
        screenId: screen1Id,
        movieId: movie._id,
        startTime,
        endTime,
        seatTypeMultipliers: { NORMAL: 1.0, PREMIUM: 1.25, LUXURY: 1.5, RECLINER: 2.0 }
    });
    const show2 = await Show.create({
        theatreId: theatre1._id,
        screenId: screen2Id,
        movieId: movie._id,
        startTime,
        endTime,
        seatTypeMultipliers: { NORMAL: 1.0, PREMIUM: 1.25, LUXURY: 1.5, RECLINER: 2.0 }
    });
    const show3 = await Show.create({
        theatreId: theatre2._id,
        screenId: screenOtherId,
        movieId: movie._id,
        startTime,
        endTime,
        seatTypeMultipliers: { NORMAL: 1.0, PREMIUM: 1.25, LUXURY: 1.5, RECLINER: 2.0 }
    });

    console.log('✅ Seeded');
    return { movie, theatre1, theatre2, screen1Id, screen2Id, screenOtherId, show1, show2, show3 };
}

async function testServerConnection() {
    try {
        console.log('🔍 Testing server connection...');
        const response = await axios.get(`${BASE_URL}/api`);
        console.log('✅ Server is running:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Server connection failed:', error.message);
        return false;
    }
}

async function testBookingFlow(seed) {
    console.log('\n🎟️ Testing booking flow (hold -> confirm -> fetch)...');
    const { theatre1, screen1Id, show1, movie } = seed;

    // Hold seats A1,A2 (PREMIUM)
    const holdBody = {
        theatreId: theatre1._id,
        screenId: screen1Id,
        showId: show1._id,
        movieId: movie._id,
        seats: [
            { seatId: 'A1', seatType: 'PREMIUM' },
            { seatId: 'A2', seatType: 'PREMIUM' }
        ]
    };

    const holdRes = await axios.post(`${BASE_URL}/api/booking/book`, holdBody);
    console.log('✅ Hold created:', holdRes.data);
    const bookingId = holdRes.data.bookingId;

    // Confirm booking
    const payRes = await axios.post(`${BASE_URL}/api/booking/pay`, { bookingId });
    console.log('✅ Booking confirmed:', payRes.data);

    // Fetch booking
    const getRes = await axios.get(`${BASE_URL}/api/booking/getbooking/${bookingId}`);
    console.log('✅ Booking fetched:', getRes.data.booking);

    return bookingId;
}

async function testHoldPreventsDoubleBooking(seed) {
    console.log('\n⏳ Testing that HELD seats cannot be rebooked...');
    const { theatre1, screen1Id, show1, movie } = seed;

    // Hold a seat A3 NORMAL
    const hold = await axios.post(`${BASE_URL}/api/booking/book`, {
        theatreId: theatre1._id,
        screenId: screen1Id,
        showId: show1._id,
        movieId: movie._id,
        seats: [{ seatId: 'A3', seatType: 'NORMAL' }]
    });
    console.log('✅ Seat A3 held:', hold.data);

    // Attempt another hold on same seat should fail with 409
    try {
        await axios.post(`${BASE_URL}/api/booking/book`, {
            theatreId: theatre1._id,
            screenId: screen1Id,
            showId: show1._id,
            movieId: movie._id,
            seats: [{ seatId: 'A3', seatType: 'NORMAL' }]
        });
        console.log('❌ Should not allow booking HELD seats');
    } catch (err) {
        console.log(err.response?.status === 409 ? '✅ Rebooking prevented (409)' : `⚠️ Unexpected: ${err.response?.status}`);
    }
}

async function testHoldExpiryAllowsRebooking(seed) {
    console.log('\n⏱️ Testing that expired HELD seats can be rebooked...');
    const { theatre1, screen1Id, show1, movie } = seed;

    // Hold seat A4 RECLINER
    const hold = await axios.post(`${BASE_URL}/api/booking/book`, {
        theatreId: theatre1._id,
        screenId: screen1Id,
        showId: show1._id,
        movieId: movie._id,
        seats: [{ seatId: 'A4', seatType: 'RECLINER' }]
    });
    const bookingId = hold.data.bookingId;
    console.log('✅ Seat A4 held:', hold.data);

    // Simulate expiry by updating holdExpiresAt in DB
    await Booking.updateOne({ _id: bookingId }, { $set: { holdExpiresAt: new Date(Date.now() - 1000) } });
    console.log('🧪 Hold forcibly expired in DB');

    // Now attempt to hold again on same seat should succeed
    const holdAgain = await axios.post(`${BASE_URL}/api/booking/book`, {
        theatreId: theatre1._id,
        screenId: screen1Id,
        showId: show1._id,
        movieId: movie._id,
        seats: [{ seatId: 'A4', seatType: 'RECLINER' }]
    });
    console.log('✅ Re-hold after expiry succeeded:', holdAgain.data);
}

async function testMultiScreenAndTheatre(seed) {
    console.log('\n🏟️ Testing bookings across multiple screens and theatres...');
    const { theatre1, theatre2, screen2Id, screenOtherId, show2, show3, movie } = seed;

    // Booking A1 on Theatre1 Screen2 should be independent from Theatre1 Screen1
    const hold1 = await axios.post(`${BASE_URL}/api/booking/book`, {
        theatreId: theatre1._id,
        screenId: screen2Id,
        showId: show2._id,
        movieId: movie._id,
        seats: [{ seatId: 'A1', seatType: 'PREMIUM' }]
    });
    console.log('✅ Held on Theatre1 Screen2:', hold1.data);

    // Booking A1 on Theatre2 Main Screen should be independent as well
    const hold2 = await axios.post(`${BASE_URL}/api/booking/book`, {
        theatreId: theatre2._id,
        screenId: screenOtherId,
        showId: show3._id,
        movieId: movie._id,
        seats: [{ seatId: 'A1', seatType: 'PREMIUM' }]
    });
    console.log('✅ Held on Theatre2 Main Screen:', hold2.data);
}

async function testSameScreenDifferentShows(seed) {
    console.log('\n🕒 Testing same screen with different shows (seat availability per show)...');
    const { theatre1, screen1Id, movie } = seed;

    // Create a second show on the SAME screen but at a later time
    const laterStart = new Date(Date.now() + 6 * 60 * 60 * 1000); // +6 hours
    const laterEnd = new Date(laterStart.getTime() + 2 * 60 * 60 * 1000);
    const Show = require('./models/show');
    const showLater = await Show.create({
        theatreId: theatre1._id,
        screenId: screen1Id,
        movieId: movie._id,
        startTime: laterStart,
        endTime: laterEnd,
        seatTypeMultipliers: { NORMAL: 1.0, PREMIUM: 1.25, LUXURY: 1.5, RECLINER: 2.0 }
    });

    // Seat A1 might already be confirmed for the earlier show; it should still be
    // available for the later show because availability is per show
    const holdLater = await axios.post(`${BASE_URL}/api/booking/book`, {
        theatreId: theatre1._id,
        screenId: screen1Id,
        showId: showLater._id,
        movieId: movie._id,
        seats: [{ seatId: 'A1', seatType: 'PREMIUM' }]
    });
    console.log('✅ Held A1 for later show on same screen:', holdLater.data);
}

async function testConflict(seed) {
    console.log('\n⚔️ Testing seat conflict (should be 409)...');
    const { theatre, screenId, show, movie } = seed;

    try {
        await axios.post(`${BASE_URL}/api/booking/book`, {
            theatreId: theatre._id,
            screenId: screenId,
            showId: show._id,
            movieId: movie._id,
            seats: [
                { seatId: 'A1', seatType: 'PREMIUM' }, // already confirmed
                { seatId: 'A2', seatType: 'PREMIUM' }
            ]
        });
        console.log('❌ Conflict test should have failed');
    } catch (err) {
        const status = err.response?.status;
        console.log(status === 409 ? '✅ Conflict correctly detected (409)' : `⚠️ Unexpected status: ${status}`);
    }
}

async function run() {
    console.log('🚀 Starting Booking API Tests...\n');
    const serverRunning = await testServerConnection();
    if (!serverRunning) {
        console.log('❌ Server is not running. Start it with: npm start');
        return;
    }

    await connectDb();
    try {
        await clearExistingTestData();
        const seed = await seedData();
        await testBookingFlow(seed);
        await testHoldPreventsDoubleBooking(seed);
        await testHoldExpiryAllowsRebooking(seed);
        await testMultiScreenAndTheatre(seed);
        await testSameScreenDifferentShows(seed);
        console.log('\n🎉 Booking tests completed!');
    } catch (e) {
        console.error('❌ Test run failed:', e.response?.data || e.message, e.stack);
    } finally {
        await mongoose.disconnect();
    }
}

run().catch(console.error);


