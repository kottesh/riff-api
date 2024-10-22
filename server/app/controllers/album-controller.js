const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getAllAlbums = async (req, res, next) => {
    try {
        const albums = await prisma.album.findMany({
            include: { tracks: true },
        });
        res.json(albums);
    } catch (error) {
        next(error);
    }
};

const getAlbumById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const album = await prisma.album.findUnique({
            where: { id },
            include: { tracks: true },
        });
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }
        res.json(album);
    } catch (error) {
        next(error);
    }
};

const createAlbum = async (req, res, next) => {
    try {
        const { title, coverUrl, releaseDate } = req.body;

        const parsedDate = new Date(releaseDate);

        const album = await prisma.album.create({
            data: {
                title,
                coverUrl,
                releaseDate: parsedDate,
            },
        });

        res.status(201).json(album);
    } catch (error) {
        next(error);
    }
};

const updateAlbum = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, coverUrl, releaseDate } = req.body;
        const album = await prisma.album.update({
            where: { id },
            data: {
                title,
                coverUrl,
                releaseDate: new Date(releaseDate),
            },
        });
        res.json(album);
    } catch (error) {
        next(error);
    }
};

const deleteAlbum = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.album.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const getAlbumTracks = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tracks = await prisma.track.findMany({
            where: { albumId: id },
            include: { artist: true },
        });
        res.json(tracks);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllAlbums,
    getAlbumById,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    getAlbumTracks,
};

