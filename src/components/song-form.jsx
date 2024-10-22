import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import axios from "axios";
import uploadImage from "../utils/cloudinary";
import uploadAudioToFirebase from "../utils/firebase";
import { extractFileName, calcDuration } from "../utils/helpers";

const uploadSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title must be less than 100 characters"),
    artistIds: z
        .array(z.string())
        .min(1, "At least one artist must be selected"),
    albumId: z.string().optional(),
    genreIds: z.array(z.string()).optional(),
    file: z
        .instanceof(File, { message: "Audio file is required" })
        .refine(
            (file) => file.type.startsWith("audio/"),
            "Only audio files are allowed"
        ),
    cover: z
        .instanceof(File, { message: "Cover image is required" })
        .refine(
            (file) => file.type.startsWith("image/"),
            "Only image files are allowed"
        )
        .optional(),
});

const SongForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedCover, setSelectedCover] = useState(null);
    const [artists, setArtists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [genres, setGenres] = useState([]);
    const [isLoadingArtists, setIsLoadingArtists] = useState(true);
    const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);
    const [isLoadingGenres, setIsLoadingGenres] = useState(true);
    const [duration, setDuration] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            title: "",
            artistIds: [],
            albumId: "",
            genreIds: [],
        },
    });

    useEffect(() => {
        fetchArtists();
        fetchAlbums();
        fetchGenres();
    }, []);

    const fetchArtists = async () => {
        setIsLoadingArtists(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/artist`
            );
            setArtists(
                Array.isArray(response.data.artists)
                    ? response.data.artists
                    : []
            );
        } catch (error) {
            console.error("Error fetching artists:", error);
            toast.error("Failed to fetch artists");
            setArtists([]);
        } finally {
            setIsLoadingArtists(false);
        }
    };

    const fetchAlbums = async () => {
        setIsLoadingAlbums(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/album`
            );
            setAlbums(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching albums:", error);
            toast.error("Failed to fetch albums");
            setAlbums([]);
        } finally {
            setIsLoadingAlbums(false);
        }
    };

    const fetchGenres = async () => {
        setIsLoadingGenres(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/genre`
            );
            setGenres(
                Array.isArray(response.data.genres) ? response.data.genres : []
            );
        } catch (error) {
            console.error("Error fetching genres:", error);
            toast.error("Failed to fetch genres");
            setGenres([]);
        } finally {
            setIsLoadingGenres(false);
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type.startsWith("audio/")) {
                setSelectedFile(file);
                setValue("file", file);
                setValue("title", extractFileName(file.name));

                try {
                    const audioDuration = await calcDuration(file);
                    setDuration(audioDuration);
                    toast.success(
                        `Duration: ${Math.floor(audioDuration / 60)}:${String(
                            audioDuration % 60
                        ).padStart(2, "0")}`
                    );
                } catch (error) {
                    console.error("Error calculating duration:", error);
                    toast.error("Failed to calculate audio duration");
                }
            } else {
                toast.error("Please select a valid audio file");
            }
        }
    };

    const handleCoverChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                setSelectedCover(file);
                setValue("cover", file);
            } else {
                toast.error("Please select a valid image file");
            }
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        const toastId = toast.loading("Uploading track...");
        try {
            const audioUrl = await uploadAudioToFirebase(data.file);
            let coverUrl = null;
            if (data.cover) {
                coverUrl = await uploadImage(data.cover);
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/song`,
                {
                    title: data.title,
                    artistIds: data.artistIds,
                    albumId: data.albumId || undefined,
                    genreIds: data.genreIds || undefined,
                    audioUrl: audioUrl,
                    coverUrl: coverUrl,
                    duration: duration,
                }
            );

            console.log("Created Track:", response.data.track);
            toast.success("Track uploaded successfully", { id: toastId });

            setSelectedFile(null);
            setSelectedCover(null);
            reset();
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload track", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <Toaster />
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Upload New Track</h2>
                <p className="text-gray-600">Add a new song</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Track File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Track File
                    </label>
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 ${
                            errors.file ? "border-red-500" : "border-gray-300"
                        }`}
                        onClick={() =>
                            document.getElementById("track-input").click()
                        }
                    >
                        {selectedFile ? (
                            <div className="flex items-center justify-center space-x-2">
                                <svg
                                    className="w-6 h-6 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                    />
                                </svg>
                                <span>{selectedFile.name}</span>
                            </div>
                        ) : (
                            <>
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                >
                                    <path
                                        d="M24 10v28m-14-14h28"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="mt-2 block text-sm text-gray-600">
                                    Click to upload audio file
                                </span>
                            </>
                        )}
                        <input
                            id="track-input"
                            type="file"
                            className="hidden"
                            accept="audio/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    {errors.file && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.file.message}
                        </p>
                    )}
                </div>

                {/* Title Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                    </label>
                    <input
                        {...register("title")}
                        type="text"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.title ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter track title"
                    />
                    {errors.title && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.title.message}
                        </p>
                    )}
                </div>

                {/* Artists Multi-Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Artists
                    </label>
                    <select
                        {...register("artistIds")}
                        multiple
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.artistIds
                                ? "border-red-500"
                                : "border-gray-300"
                        }`}
                        disabled={isLoadingArtists}
                    >
                        {artists.map((artist) => (
                            <option key={artist.id} value={artist.id}>
                                {artist.name}
                            </option>
                        ))}
                    </select>
                    {errors.artistIds && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.artistIds.message}
                        </p>
                    )}
                    {isLoadingArtists && (
                        <p className="mt-1 text-sm text-gray-500">
                            Loading artists...
                        </p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                        Hold Ctrl/Cmd to select multiple artists
                    </p>
                </div>

                {/* Album Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Album (Optional)
                    </label>
                    <select
                        {...register("albumId")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoadingAlbums}
                    >
                        <option value="">Select album</option>
                        {albums.map((album) => (
                            <option key={album.id} value={album.id}>
                                {album.title}
                            </option>
                        ))}
                    </select>
                    {isLoadingAlbums && (
                        <p className="mt-1 text-sm text-gray-500">
                            Loading albums...
                        </p>
                    )}
                </div>

                {/* Genres Multi-Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Genres (Optional)
                    </label>
                    <select
                        {...register("genreIds")}
                        multiple
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoadingGenres}
                    >
                        {genres.map((genre) => (
                            <option key={genre.id} value={genre.id}>
                                {genre.name}
                            </option>
                        ))}
                    </select>
                    {isLoadingGenres && (
                        <p className="mt-1 text-sm text-gray-500">
                            Loading genres...
                        </p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                        Hold Ctrl/Cmd to select multiple genres
                    </p>
                </div>

                {/* Cover Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Image (Optional)
                    </label>
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                            document.getElementById("cover-input").click()
                        }
                    >
                        {selectedCover ? (
                            <div className="flex items-center justify-center">
                                <img
                                    src={URL.createObjectURL(selectedCover)}
                                    alt="Cover preview"
                                    className="h-24 w-24 object-cover rounded"
                                />
                            </div>
                        ) : (
                            <>
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                >
                                    <path
                                        d="M24 10v28m-14-14h28"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="mt-2 block text-sm text-gray-600">
                                    Click to upload cover image
                                </span>
                            </>
                        )}
                        <input
                            id="cover-input"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleCoverChange}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || isLoadingArtists || isLoadingAlbums}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium 
            ${
                isLoading || isLoadingArtists || isLoadingAlbums
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
            }`}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Uploading...
                        </span>
                    ) : (
                        "Upload Track"
                    )}
                </button>
            </form>
        </div>
    );
};

export default SongForm;
