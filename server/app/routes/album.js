const express = require("express");
const router = express.Router();
const {
    getAllAlbums,
    getAlbumById,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    getAlbumTracks,
} = require("../controllers/album-controller");

router.get("/", getAllAlbums);
router.get("/:id", getAlbumById);
router.post("/", createAlbum);
router.put("/:id", updateAlbum);
router.delete("/:id", deleteAlbum);
router.get("/:id/tracks", getAlbumTracks);

module.exports = router;
