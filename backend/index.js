const express = require('express');
const mongoose = require('mongoose');
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require('body-parser');

require("dotenv").config();

const app = express();
const port = process.env.PORT || 8001;

// Middleware
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fintek', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/UserAccessRoutes'));



// api/booking/book => make the holding for the movie(5 mins hold for the seata)
// api/booking/pay => pay the amount for the movie
// api/booking/getbooking/:id => get the booking details

app.use('/api/booking', require('./routes/BookingRoutes'));

// api/movies => get the movies
app.use('/api/movies', require('./routes/MoviesRoutes'));




// Basic route
app.get('/api', (req, res) => {
    console.log("OK");
    res.send({ values: 'Hello World' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});