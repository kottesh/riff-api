const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const searchArtists = async (req, res) => {
    try {
        const {
            query,
            page = 1,
            limit = 10,
            sortBy = 'name',
            order = 'asc'
        } = req.query;

        const skip = (page - 1) * Number(limit);

        const whereCondition = query ? {
            OR: [
                {
                    name: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                {
                    bio: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                {
                    tracks: {
                        some: {
                            title: {
                                contains: query,
                                mode: 'insensitive'
                            }
                        }
                    }
                }
            ]
        } : {};

        const orderBy = {};
        orderBy[sortBy] = order;

        const totalCount = await prisma.artist.count({
            where: whereCondition
        });

        const artists = await prisma.artist.findMany({
            where: whereCondition,
            include: {
                tracks: {
                    include: {
                        album: true,
                        trackGenres: {
                            include: {
                                genre: true
                            }
                        }
                    }
                },
                followers: {
                    select: {
                        userId: true
                    }
                }
            },
            orderBy,
            skip,
            take: Number(limit)
        });

        res.json({
            data: artists,
            pagination: {
                total: totalCount,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(totalCount / Number(limit))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to search artists",
            error: error.message
        });
    }
};

const createArtist = async (req, res) => {
    try {
        const { name, bio, image } = req.body;

        const artist = await prisma.artist.create({
            data: {
                name,
                bio,
                image,
            },
            include: {
                tracks: true,
                followers: {
                    select: {
                        userId: true
                    }
                }
            }
        });

        res.status(201).json({
            message: "Artist created successfully",
            data: artist
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create artist",
            error: error.message
        });
    }
};

const getAllArtists = async (req, res) => {
    try {
        const artists = await prisma.artist.findMany({
            include: {
                tracks: {
                    include: {
                        album: true,
                        trackGenres: {
                            include: {
                                genre: true
                            }
                        }
                    }
                },
                followers: {
                    select: {
                        userId: true
                    }
                }
            },
        });

        res.json({
             artists
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to get artists",
            error: error.message
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
                tracks: {
                    include: {
                        album: true,
                        trackGenres: {
                            include: {
                                genre: true
                            }
                        }
                    }
                },
                followers: {
                    select: {
                        userId: true
                    }
                }
            },
        });

        if (!artist) {
            return res.status(404).json({
                message: "Artist not found"
            });
        }

        res.json({
            data: artist
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to get artist",
            error: error.message
        });
    }
};

const updateArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, bio, image } = req.body;

        const updatedArtist = await prisma.artist.update({
            where: {
                id: id,
            },
            data: {
                name,
                bio,
                image,
            },
            include: {
                tracks: true,
                followers: {
                    select: {
                        userId: true
                    }
                }
            }
        });
        res.json({
            message: "Artist updated successfully",
             updatedArtist
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update artist",
            error: error.message
        });
    }
};

const deleteArtist = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.artist.delete({
            where: {
                id: id,
            },
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete artist",
            error: error.message
        });
    }
};

const getArtistTracks = async (req, res) => {
    try {
        const { id } = req.params;
        
        const tracks = await prisma.track.findMany({
            where: {
                artistIds: {
                    has: id
                }
            },
            include: {
                album: true,
                artists: true,
                trackGenres: {
                    include: {
                        genre: true
                    }
                }
            }
        });

        res.json({
             tracks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to get artist tracks",
            error: error.message
        });
    }
};

module.exports = {
    searchArtists,
    createArtist,
    getAllArtists,
    getArtistById,
    updateArtist,
    deleteArtist,
    getArtistTracks
};







