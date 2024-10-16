const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createSong = async (req, res) => {
    try {
        const { title, duration, artist_id, album_id, track_url, cover_url } =
            req.body;

        const song = await prisma.track.create({
            title,
            duration,
            fileUrl: track_url,
            coverUrl: cover_url,
            artist: {
                connect: {
                    id: artist_id,
                },
            },
            album: album_id
                ? {
                      connect: {
                          id: album_id,
                      },
                  }
                : undefined,
        });

        res.status(201).json(song);
    } catch (error) {
        console.error("Error creating the song", error);
        res.status(500).json({ error: "failed to create the song" });
    }
};

const getAllSongs = async (req, res) => {
    try {
        const songs = await prisma.track.findMany({
            include: {
                artist: true,
                album: true,
            },
        });
        return res.status(200).json(songs);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "failed to get all songs.",
        });
    }
};

const getSongById = async (req, res) => {
    try {
        const song = await prisma.track.findUnique({
            where: {
                id: req.params.id,
            },
            include: {
                artist: true,
                album: true,
            },
        });

        return res.status(200).json(song);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "can't find the request song",
        });
    }
};

const updateSong = async (req, res) => {
    try {
        const updated_song = await prisma.track.update({
            where: {
                id: req.params.id,
            },
            ...req.body,
        });

        res.json(updatedSong);
    } catch (err) {
        console.error(err);
        res.status(500);
    }
};

const deleteSong = async (req, res) => {
    try {
        await prisma.track.delete({
            where: {
                id: req.params.id,
            },
        });
        res.status(204).send();
    } catch (err) {
        console.log(err);
    }
};

module.exports = {
    createSong,
    getAllSongs,
    getSongById,
    updateSong,
    deleteSong,
};
