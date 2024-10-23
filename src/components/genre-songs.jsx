import React, { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast, Toaster } from "sonner";

const songGenreSchema = z.object({
    trackId: z.string().min(1, "Track selection is required"),
    genreIds: z.array(z.string()).min(1, "At least one genre must be selected"),
});

const SongsGenreForm = () => {
    const [tracks, setTracks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(songGenreSchema),
        defaultValues: {
            trackId: "",
            genreIds: [],
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tracksResponse, genresResponse] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/song`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/genre`),
                ]);
                setTracks(tracksResponse.data.tracks);
                setGenres(genresResponse.data.genres);
            } catch (error) {
                console.error("Error fetching ", error);
                toast.error("Failed to load tracks or genres");
            }
        };

        fetchData();
    }, []);

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            const promises = data.genreIds.map((genreId) =>
                axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/genre/song`,
                    {
                        trackId: data.trackId,
                        genreId: genreId,
                    }
                )
            );

            await Promise.all(promises);
            toast.success("Genres assigned successfully");
            reset();
        } catch (error) {
            console.error("Error assigning genres:", error);
            toast.error("Failed to assign genres");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-8 text-left text-gray-800">
                Assign Genres to Track
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label
                        htmlFor="trackId"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Select Track *
                    </label>
                    <select
                        id="trackId"
                        {...register("trackId")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                    >
                        <option value="">Select a track...</option>
                        {tracks.map((track) => (
                            <option key={track.id} value={track.id}>
                                {track.title}
                            </option>
                        ))}
                    </select>
                    {errors.trackId && (
                        <p className="mt-2 text-sm text-red-600">
                            {errors.trackId.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Genres *
                    </label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        {genres.map((genre) => (
                            <div key={genre.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={genre.id}
                                    value={genre.id}
                                    {...register("genreIds")}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor={genre.id}
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    {genre.name}
                                </label>
                            </div>
                        ))}
                    </div>
                    {errors.genreIds && (
                        <p className="mt-2 text-sm text-red-600">
                            {errors.genreIds.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-200 ease-in-out"
                >
                    {isSubmitting ? "Assigning..." : "Assign Genres"}
                </button>
            </form>
            <Toaster />
        </div>
    );
};

export default SongsGenreForm;
