const { Router } = require('express');
const { holdSeats, confirmBooking, getBooking } = require('../controllers/BookingController');

const router = Router();

router.post('/book', holdSeats);
router.post('/pay', confirmBooking);
router.get('/getbooking/:id', getBooking);

module.exports = router;

