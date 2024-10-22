const express = require("express");
const router = express.Router();
const {
    createSong,
    getAllSongs,
    getSongById,
    updateSong,
    deleteSong,
    getSongsByArtist,
    getSongsByAlbum,
    getSongsByGenre
} = require("../controllers/song-controller");

router.get("/artist/:artistId", getSongsByArtist);
router.get("/album/:albumId", getSongsByAlbum);
router.get("/genre/:genreId", getSongsByGenre);
router.post("/", createSong);
router.get("/", getAllSongs);
router.get("/:id", getSongById);
router.put("/:id", updateSong);
router.delete("/:id", deleteSong);

module.exports = router;
