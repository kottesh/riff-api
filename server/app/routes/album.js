const express = require("express");
const router = express.Router();
const {
    getAllAlbums,
    getAlbumById,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    getAlbumTracks,
    searchAlbums,
} = require("../controllers/album-controller");

router.get("/search", searchAlbums);
router.get("/", getAllAlbums);
router.get("/:id", getAlbumById);
router.post("/", createAlbum);
router.put("/:id", updateAlbum);
router.delete("/:id", deleteAlbum);
router.get("/:id/tracks", getAlbumTracks);

module.exports = router;
