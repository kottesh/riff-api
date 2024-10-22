const express = require('express');
const router = express.Router();
const {
    createGenre,
    getAllGenres,
    getGenreById,
    updateGenre,
    deleteGenre,
    addSong
} = require('../controllers/genre-controller');

router.post('/', createGenre);
router.post('/song', addSong);
router.get('/', getAllGenres);
router.get('/:id', getGenreById);
router.put('/:id', updateGenre);
router.delete('/:id', deleteGenre);

module.exports = router;
