const { Router } = require('express');
const Movie = require('../models/movie');

const router = Router();

// GET /api/movies - list all movies
router.get('/', async (req, res, next) => {
    try {
        const movies = await Movie.find({}).sort({ createdAt: -1 });
        res.status(200).json({ movies });
    } catch (err) {
        next(err);
    }
});

module.exports = router;

