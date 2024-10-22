const express = require("express");
const router = express.Router();
const {
    createArtist,
    getAllArtist,
    getArtistById,
    updateArtist,
    deleteArtist,
} = require("../controllers/artist-controller");

router.post("/", createArtist);
router.get("/", getAllArtist);
router.get("/:id", getArtistById);
router.put("/:id", updateArtist);
router.delete("/:id", deleteArtist);

module.exports = router;

