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
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
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

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                setSelectedImage(file);
                const fileList = new DataTransfer();
                fileList.items.add(file);
                setValue("image", fileList.files);
            } else {
                toast.error("Please select a valid image file");
            }
        }
    };

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
            setSelectedImage(null);
            toast.success("Artist Created Successfully");
        } catch (err) {
            console.error(err);
            toast.error("Error creating the artist");
        } finally {
            setIsSubmitting(false);
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Artist Image
                    </label>
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                        onClick={() => document.getElementById("image-input").click()}
                    >
                        {selectedImage ? (
                            <div className="flex items-center justify-center">
                                <img
                                    src={URL.createObjectURL(selectedImage)}
                                    alt="Artist preview"
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
                                    Click to upload artist image
                                </span>
                            </>
                        )}
                        <input
                            id="image-input"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
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
