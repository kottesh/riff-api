const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const searchAlbums = async (req, res, next) => {
    try {
        const { 
            query,
            page = 1,
            limit = 10,
            sortBy = 'releaseDate',
            order = 'desc'
        } = req.query;

        const skip = (page - 1) * Number(limit);

        const whereCondition = query ? {
            OR: [
                {
                    title: {
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

        const totalCount = await prisma.album.count({
            where: whereCondition
        });

        const albums = await prisma.album.findMany({
            where: whereCondition,
            include: {
                tracks: {
                    include: {
                        artists: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                }
            },
            orderBy,
            skip,
            take: Number(limit)
        });

        res.json({
            data: albums,
            pagination: {
                total: totalCount,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(totalCount / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

const getAllAlbums = async (req, res, next) => {
    try {
        const albums = await prisma.album.findMany({
            include: { 
                tracks: {
                    include: {
                        artists: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                }
            },
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
            include: { 
                tracks: {
                    include: {
                        artists: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                }
            },
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
            include: {
                tracks: true
            }
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
            include: {
                tracks: true
            }
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
            include: {
                artists: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
        });
        res.json(tracks);
    } catch (error) {
        next(error);
    }
};

const getAlbumsByArtistId = async (req, res) => {
    try {
        const { artistId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        
        const tracks = await prisma.track.findMany({
            where: {
                artistIds: {
                    has: artistId  
                }
            },
            select: {
                albumId: true
            }
        });

        
        const albumIds = [...new Set(tracks
            .map(track => track.albumId)
            .filter(id => id !== null))];

        const albums = await prisma.album.findMany({
            where: {
                id: {
                    in: albumIds
                }
            },
            include: {
                tracks: {
                    include: {
                        artists: true
                    }
                }
            },
            orderBy: {
                releaseDate: 'desc'
            },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit)
        });

        const total = await prisma.album.count({
            where: {
                id: {
                    in: albumIds
                }
            }
        });

        res.status(200).json({
            albums,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error fetching albums:', error);
        res.status(500).json({ error: "Failed to fetch artist albums" });
    }
};
module.exports = {
    searchAlbums,
    getAllAlbums,
    getAlbumById,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    getAlbumTracks,
    getAlbumsByArtistId
};
