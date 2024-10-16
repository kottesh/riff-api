const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createArtist = async (req, res) => {
    try {
        const { name, bio, image } = req.body;

        const artist = await prisma.artist.create({
            data: {
                name,
                bio,
                image,
            },
        });

        res.status(200).json({
            message: "artist created successfully.",
            artist,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "can't create the artists" });
    }
};

const getAllArtist = async (req, res) => {
    try {
        const artists = await prisma.artist.findMany({
            include: {
                tracks: true,
                albums: true,
            },
        });

        res.status(200).json({ artists });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "failed to get all the artist",
        });
    }
};

const getArtistById = async (req, res) => {
    try {
        const { id } = req.params;

        const artist = await prisma.artist.findUnique({
            where: {
                id: id,
            },
            include: {
                tracks: true,
                albums: true,
            },
        });

        if (!artist) {
            return res.status(404).json({
                message: "Artist not found",
            });
        }

        res.status(200).json({
            artist,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "failed to get the artist",
        });
    }
};

const updateArtist = async (req, res) => {
    try {
        const updatedArtist = await prisma.artist.update({
            where: {
                id: req.params.id,
            },
            data: {
                ...req.body,
            },
        });

        res.json(updatedArtist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "failed to update the artist" });
    }
};

const deleteArtist = async (req, res) => {
    const id = req.params.id;

    try {
        await prisma.artist.delete({
            where: {
                id: id,
            },
        });
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "failed to delete the artist",
        });
    }
};

module.exports = {
    createArtist,
    getAllArtist,
    getArtistById,
    updateArtist,
    deleteArtist,
};
