const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createGenre = async (req, res) => {
    try {
        const { name, image } = req.body;

        if (!name || !image) {
            return res
                .status(400)
                .json({ error: "Name and image are required" });
        }

        const existingGenre = await prisma.genre.findUnique({
            where: { name },
        });
        if (existingGenre) {
            return res.status(409).json({ error: "Genre already exists" });
        }

        const genre = await prisma.genre.create({
            data: { name, image },
        });

        res.status(201).json({
            message: "Genre created successfully",
            genre,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create the genre" });
    }
};

const addSong = async (req, res) => {
    try {
        const { trackId, genreId } = req.body;

        if (!trackId || !genreId) {
            return res.status(400).json({
                error: "Track ID and Genre ID are required",
            });
        }

        const [track, genre] = await Promise.all([
            prisma.track.findUnique({
                where: { id: trackId },
            }),
            prisma.genre.findUnique({
                where: { id: genreId },
            }),
        ]);

        if (!track) {
            return res.status(404).json({ error: "Track not found" });
        }

        if (!genre) {
            return res.status(404).json({ error: "Genre not found" });
        }

        // check if the relationship already exists
        const existingRelation = await prisma.trackGenre.findUnique({
            where: {
                trackId_genreId: {
                    trackId,
                    genreId,
                },
            },
        });

        if (existingRelation) {
            return res.status(409).json({
                error: "This track is already assigned to this genre",
            });
        }

        const trackGenre = await prisma.trackGenre.create({
            data: {
                trackId,
                genreId,
            },
            include: {
                track: {
                    include: {
                        artist: true,
                        album: true,
                    },
                },
                genre: true,
            },
        });

        res.status(201).json({
            message: "Song added to genre successfully",
            trackGenre,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to add the song to genre",
        });
    }
};


const getAllGenres = async (req, res) => {
    try {
        const { 
            search,
            page = 1,
            limit = 20,
            sortBy = 'name',
            order = 'asc'
        } = req.query;

        // Convert page and limit to numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build the where clause for search
        const whereClause = search ? {
            name: {
                contains: search,
                mode: 'insensitive'
            }
        } : {};

        // Get total count for pagination
        const totalGenres = await prisma.genre.count({
            where: whereClause
        });

        // Build sort object
        const orderBy = {
            [sortBy]: order
        };

        // Fetch genres with pagination, search, and sorting
        const genres = await prisma.genre.findMany({
            where: whereClause,
            include: {
                tracks: {
                    include: {
                        track: {
                            include: {
                                artists: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true
                                    }
                                },
                                album: {
                                    select: {
                                        id: true,
                                        title: true,
                                        coverUrl: true,
                                        releaseDate: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy,
            skip,
            take: limitNum
        });

        // Transform the response
        const transformedGenres = genres.map((genre) => ({
            id: genre.id,
            name: genre.name,
            image: genre.image,
            trackCount: genre.tracks.length,
            tracks: genre.tracks.map((t) => ({
                id: t.track.id,
                title: t.track.title,
                duration: t.track.duration,
                fileUrl: t.track.fileUrl,
                coverUrl: t.track.coverUrl,
                album: t.track.album ? {
                    id: t.track.album.id,
                    title: t.track.album.title,
                    coverUrl: t.track.album.coverUrl,
                    releaseDate: t.track.album.releaseDate
                } : null,
                artists: t.track.artists
            }))
        }));

        res.json({
            genres: transformedGenres,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalGenres / limitNum),
                totalItems: totalGenres,
                itemsPerPage: limitNum,
                hasNextPage: pageNum < Math.ceil(totalGenres / limitNum),
                hasPreviousPage: pageNum > 1
            }
        });
    } catch (err) {
        console.error('Error in getAllGenres:', err);
        res.status(500).json({ 
            error: "Failed to get genres",
            message: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

//const getAllGenres = async (req, res) => {
//    try {
//        const genres = await prisma.genre.findMany({
//            include: {
//                tracks: {
//                    include: {
//                        track: {
//                            include: {
//                                artists: {
//                                    select: {
//                                        id: true,
//                                        name: true
//                                    }
//                                },
//                                album: true,
//                            },
//                        },
//                    },
//                },
//            },
//        });
//
//        // Transform the response to include track count and simplified track data
//        const transformedGenres = genres.map((genre) => ({
//            ...genre,
//            trackCount: genre.tracks.length,
//            tracks: genre.tracks.map((t) => ({
//                ...t.track,
//                genreId: t.genreId,
//            })),
//        }));
//
//        res.json({ genres: transformedGenres });
//    } catch (err) {
//        console.error(err);
//        res.status(500).json({ error: "Failed to get all genres" });
//    }
//};

const getGenreById = async (req, res) => {
    try {
        const { id } = req.params;

        const genre = await prisma.genre.findUnique({
            where: { id },
            include: {
                tracks: {
                    include: {
                        track: {
                            include: {
                                artists: true,
                                album: true,
                            },
                        },
                    },
                },
            },
        });

        if (!genre) {
            return res.status(404).json({ error: "Genre not found" });
        }

        // Transform the response
        const transformedGenre = {
            ...genre,
            trackCount: genre.tracks.length,
            tracks: genre.tracks.map((t) => ({
                ...t.track,
                genreId: t.genreId,
            })),
        };

        res.json({ genre: transformedGenre });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get the genre" });
    }
};

const updateGenre = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image } = req.body;

        if (!name && !image) {
            return res
                .status(400)
                .json({ error: "Name or image is required for update" });
        }

        const existingGenre = await prisma.genre.findUnique({ where: { id } });
        if (!existingGenre) {
            return res.status(404).json({ error: "Genre not found" });
        }

        if (name && name !== existingGenre.name) {
            const nameExists = await prisma.genre.findUnique({
                where: { name },
            });
            if (nameExists) {
                return res
                    .status(409)
                    .json({ error: "Genre name already exists" });
            }
        }

        const updatedGenre = await prisma.genre.update({
            where: { id },
            data: {
                name: name || existingGenre.name,
                image: image || existingGenre.image,
            },
        });

        res.json({
            message: "Genre updated successfully",
            genre: updatedGenre,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update the genre" });
    }
};

const deleteGenre = async (req, res) => {
    try {
        const { id } = req.params;

        // First delete all track-genre relationships
        await prisma.trackGenre.deleteMany({
            where: { genreId: id },
        });

        // Then delete the genre
        await prisma.genre.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete the genre" });
    }
};

const removeSongFromGenre = async (req, res) => {
    try {
        const { trackId, genreId } = req.params;

        const trackGenre = await prisma.trackGenre.delete({
            where: {
                trackId_genreId: {
                    trackId,
                    genreId,
                },
            },
        });

        if (!trackGenre) {
            return res.status(404).json({
                error: "Track-genre relationship not found",
            });
        }

        res.json({
            message: "Track removed from genre successfully",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to remove track from genre",
        });
    }
};

const getTracksByGenre = async (req, res) => {
    try {
        const { genreId } = req.params;
        const { page = 1, limit = 10, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {
            genreId,
            ...(search && {
                track: {
                    title: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            }),
        };

        // get tracks with pagination
        const [tracks, total] = await Promise.all([
            prisma.trackGenre.findMany({
                where,
                include: {
                    track: {
                        include: {
                            artist: true,
                            album: true,
                        },
                    },
                },
                skip,
                take: parseInt(limit),
                orderBy: {
                    track: {
                        title: "asc",
                    },
                },
            }),
            prisma.trackGenre.count({ where }),
        ]);

        res.json({
            tracks: tracks.map((t) => t.track),
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                currentPage: parseInt(page),
                limit: parseInt(limit),
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to get tracks for the genre",
        });
    }
};

module.exports = {
    createGenre,
    getAllGenres,
    getGenreById,
    updateGenre,
    deleteGenre,
    addSong,
    removeSongFromGenre,
    getTracksByGenre,
};
