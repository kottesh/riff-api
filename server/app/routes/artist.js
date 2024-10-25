const express = require("express");
const router = express.Router();
const {
    searchArtists,
    createArtist,
    getAllArtists,
    getArtistById,
    updateArtist,
    deleteArtist,
    getArtistTracks,
} = require("../controllers/artist-controller");

router.get("/search", searchArtists);
router.post("/", createArtist);
router.get("/", getAllArtists);
router.get("/:id", getArtistById);
router.put("/:id", updateArtist);
router.delete("/:id", deleteArtist);
router.get("/:id/tracks", getArtistTracks);

module.exports = router;
