import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import uploadImage from "../utils/cloudinary";
import { toast, Toaster } from "sonner";

const artistSchema = z.object({
    name: z.string().min(1, "Artist name is required"),
    bio: z.string().optional(),
    image: z.instanceof(FileList).optional(),
});

const ArtistForm = () => {
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(artistSchema),
        defaultValues: {
            name: "",
            bio: "",
        },
    });

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
    });

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            let imageUrl = null;

            if (data.image?.[0]) {
                try {
                    imageUrl = await uploadImage(data.image[0]);
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to upload the image.");
                    setIsSubmitting(false);
                    return;
                }
            }

            const response = await api.post("/api/artist", {
                name: data.name,
                bio: data.bio,
                image: imageUrl,
            });

            console.log("Created Artist:", response.data.artist);

            reset();
            setImagePreview(null);
            toast.success("Artist Created Successfully");
        } catch (err) {
            console.error(err);
            toast.error("Error creating the artist");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-8 text-left text-gray-800">
                Add New Artist
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Artist Name *
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register("name")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                    />
                    {errors.name && (
                        <p className="mt-2 text-sm text-red-600">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Biography
                    </label>
                    <textarea
                        id="bio"
                        {...register("bio")}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                    />
                    {errors.bio && (
                        <p className="mt-2 text-sm text-red-600">
                            {errors.bio.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="image"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Artist Image
                    </label>
                    <input
                        id="image"
                        type="file"
                        accept="image/*"
                        {...register("image")}
                        onChange={handleImageChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-200 ease-in-out"
                    />
                    {imagePreview && (
                        <div className="mt-4">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="h-40 w-40 object-cover rounded-lg shadow-md"
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-200 ease-in-out"
                >
                    {isSubmitting ? "Creating..." : "Create Artist"}
                </button>
            </form>
            <Toaster />
        </div>
    );
};

export default ArtistForm;
