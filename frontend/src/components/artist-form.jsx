import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import uploadImage from "../utils/cloudinary";
import { toast } from "sonner";
import { Buffer } from "buffer";

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

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            let imageUrl = null;

            if (data.image?.[0]) {
                try {
                    const buffer = await data.image[0].arrayBuffer();
                    const file = {
                        buffer: Buffer.from(buffer),
                        originalname: data.image[0].name,
                    };

                    imageUrl = await uploadImage(file);
                } catch (err) {
                    console.error(err);
                    throw new Error("Failed to upload the image.");
                }
            }

            const response = await axios.post("/api/artist", {
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
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Add New Artist</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Artist Name *
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register("name")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                        focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Biography
                    </label>
                    <textarea
                        id="bio"
                        {...register("bio")}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                        focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.bio && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.bio.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="image"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Artist Image
                    </label>
                    <input
                        id="image"
                        type="file"
                        accept="image/*"
                        {...register("image")}
                        onChange={handleImageChange}
                        className="mt-1 block w-full"
                    />
                    {imagePreview && (
                        <div className="mt-2">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="h-32 w-32 object-cover rounded-lg"
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent 
                        rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 
                        hover:bg-indigo-700 focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isSubmitting ? "Creating..." : "Create Artist"}
                </button>
            </form>
        </div>
    );
};

export default ArtistForm;
