const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createSong = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        const {
            title,
            artistIds,
            albumId,
            audioUrl,
            coverUrl,
            genreIds,
            duration,
        } = req.body;

        // Validation
        if (!title || !artistIds?.length || !audioUrl) {
            return res.status(400).json({
                error: "Missing required fields: title, artistIds, or audioUrl",
            });
        }

        // Verify all artists exist
        const artists = await prisma.artist.findMany({
            where: {
                id: {
                    in: artistIds,
                },
            },
        });

        if (artists.length !== artistIds.length) {
            return res.status(404).json({
                error: "One or more artists not found",
            });
        }

        // Create the create data object
        const createData = {
            title,
            duration,
            fileUrl: audioUrl,
            coverUrl: coverUrl || "",
            artists: {
                connect: artistIds.map((id) => ({ id })),
            },
        };

        // Only add album connection if albumId exists
        if (albumId) {
            createData.album = {
                connect: { id: albumId },
            };
        }

        // Only add genre connections if genreIds exists
        if (genreIds?.length > 0) {
            createData.trackGenres = {
                create: genreIds.map((genreId) => ({
                    genre: {
                        connect: { id: genreId },
                    },
                })),
            };
        }

        // Create track
        const track = await prisma.track.create({
            data: createData,
            include: {
                artists: true,
                album: true,
                trackGenres: {
                    include: {
                        genre: true,
                    },
                },
            },
        });

        console.log("Created track:", track);

        res.status(201).json({
            message: "Track created successfully",
            track,
        });
    } catch (error) {
        console.error("Detailed error:", error);
        res.status(500).json({
            error: "Failed to create track",
            details: error.message,
        });
    }
};

const getAllSongs = async (req, res) => {
    try {
        const {
            search,
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            order = "desc",
            searchBy = "all", // new parameter to specify search scope
        } = req.query;

        let where = {};

        if (search) {
            // search conditions based on searchBy parameter
            switch (searchBy) {
                case "title":
                    where = {
                        title: { contains: search, mode: "insensitive" },
                    };
                    break;
                case "artist":
                    where = {
                        artists: {
                            some: {
                                name: { contains: search, mode: "insensitive" },
                            },
                        },
                    };
                    break;
                case "album":
                    where = {
                        album: {
                            title: { contains: search, mode: "insensitive" },
                        },
                    };
                    break;
                case "genre":
                    where = {
                        trackGenres: {
                            some: {
                                genre: {
                                    name: {
                                        contains: search,
                                        mode: "insensitive",
                                    },
                                },
                            },
                        },
                    };
                    break;
                case "all":
                default:
                    where = {
                        OR: [
                            {
                                title: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },
                            {
                                artists: {
                                    some: {
                                        name: {
                                            contains: search,
                                            mode: "insensitive",
                                        },
                                    },
                                },
                            },
                            {
                                album: {
                                    title: {
                                        contains: search,
                                        mode: "insensitive",
                                    },
                                },
                            },
                            {
                                trackGenres: {
                                    some: {
                                        genre: {
                                            name: {
                                                contains: search,
                                                mode: "insensitive",
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    };
            }
        }

        const tracks = await prisma.track.findMany({
            where,
            skip: (page - 1) * parseInt(limit),
            take: parseInt(limit),
            orderBy: { [sortBy]: order },
            include: {
                artists: true,
                album: true,
                trackGenres: {
                    include: {
                        genre: true,
                    },
                },
            },
        });

        const total = await prisma.track.count({ where });

        res.status(200).json({
            tracks,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch tracks" });
    }
};

const getSongById = async (req, res) => {
    try {
        const { id } = req.params;

        const track = await prisma.track.findUnique({
            where: { id },
            include: {
                artist: true,
                album: true,
                trackGenres: {
                    include: {
                        genre: true,
                    },
                },
            },
        });

        if (!track) {
            return res.status(404).json({ error: "Track not found" });
        }

        res.status(200).json({ track });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch track" });
    }
};

const updateSong = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, artistIds, albumId, genreIds } = req.body;

        let updateData = {
            title,
            ...(artistIds && { artistIds: artistIds }),
        };

        if (albumId) {
            updateData.album = { connect: { id: albumId } };
        }

        if (req.files?.track) {
            const fileUrl = await uploadTrack(req.files.track);
            updateData.fileUrl = fileUrl;
        }

        if (req.files?.cover) {
            const coverUrl = await uploadTrack(req.files.cover);
            updateData.coverUrl = coverUrl;
        }

        if (genreIds) {
            await prisma.trackGenre.deleteMany({
                where: { trackId: id },
            });

            updateData.trackGenres = {
                create: genreIds.map((genreId) => ({
                    genre: {
                        connect: { id: genreId },
                    },
                })),
            };
        }

        const track = await prisma.track.update({
            where: { id },
            updateData,
            include: {
                artists: true,
                album: true,
                trackGenres: {
                    include: {
                        genre: true,
                    },
                },
            },
        });

        res.status(200).json({
            message: "Track updated successfully",
            track,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update track" });
    }
};

const deleteSong = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.track.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete track" });
    }
};

const getSongsByArtist = async (req, res) => {
    try {
        const { artistId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const tracks = await prisma.track.findMany({
            where: { artistId },
            skip: (page - 1) * limit,
            take: parseInt(limit),
            include: {
                artist: true,
                album: true,
                trackGenres: {
                    include: {
                        genre: true,
                    },
                },
            },
        });

        const total = await prisma.track.count({ where: { artistId } });

        res.status(200).json({
            tracks,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch artist tracks" });
    }
};

const getSongsByAlbum = async (req, res) => {
    try {
        const { albumId } = req.params;
        const tracks = await prisma.track.findMany({
            where: { albumId },
            include: {
                artist: true,
                trackGenres: {
                    include: {
                        genre: true,
                    },
                },
            },
        });

        res.status(200).json({ tracks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch album tracks" });
    }
};

const getSongsByGenre = async (req, res) => {
    try {
        const { genreId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const tracks = await prisma.track.findMany({
            where: {
                trackGenres: {
                    some: {
                        genreId,
                    },
                },
            },
            skip: (page - 1) * limit,
            take: parseInt(limit),
            include: {
                artist: true,
                album: true,
                trackGenres: {
                    include: {
                        genre: true,
                    },
                },
            },
        });

        const total = await prisma.track.count({
            where: {
                trackGenres: {
                    some: {
                        genreId,
                    },
                },
            },
        });

        res.status(200).json({
            tracks,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch genre tracks" });
    }
};

module.exports = {
    createSong,
    getAllSongs,
    getSongById,
    updateSong,
    deleteSong,
    getSongsByArtist,
    getSongsByAlbum,
    getSongsByGenre,
};
