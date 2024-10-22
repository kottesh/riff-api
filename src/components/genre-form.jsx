import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast, Toaster } from "sonner";
import uploadImage from "../utils/cloudinary";

const genreSchema = z.object({
    name: z.string().min(1, "Genre name is required"),
    image: z.custom((value) => {
        return value instanceof FileList && value.length > 0;
    }, "Please upload cover image"),
});

const GenreForm = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({
        resolver: zodResolver(genreSchema),
        defaultValues: {
            name: "",
            image: undefined,
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

            let imageUrl;
            try {
                imageUrl = await uploadImage(data.image[0]);
            } catch (err) {
                console.error(err);
                toast.error("Failed to upload the image.");
                setIsSubmitting(false);
                return;
            }

            const response = await api.post("/api/genre", {
                name: data.name,
                image: imageUrl,
            });

            console.log("Created Genre:", response.data.genre);

            reset();
            setSelectedImage(null);
            toast.success("Genre Created Successfully");
        } catch (err) {
            console.error(err);
            toast.error("Error creating the genre");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-8 text-left text-gray-800">
                Add New Genre
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Genre Name *
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Genre Image *
                    </label>
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition duration-200 ${
                            errors.image ? "border-red-300" : "border-gray-300"
                        }`}
                        onClick={() =>
                            document.getElementById("image-input").click()
                        }
                    >
                        {selectedImage ? (
                            <div className="flex items-center justify-center">
                                <img
                                    src={URL.createObjectURL(selectedImage)}
                                    alt="Genre preview"
                                    className="h-24 w-24 object-cover rounded"
                                />
                            </div>
                        ) : (
                            <>
                                <svg
                                    className={`mx-auto h-12 w-12 ${
                                        errors.image
                                            ? "text-red-300"
                                            : "text-gray-400"
                                    }`}
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
                                <span
                                    className={`mt-2 block text-sm ${
                                        errors.image
                                            ? "text-red-500"
                                            : "text-gray-600"
                                    }`}
                                >
                                    Click to upload genre image
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
                    {errors.image && (
                        <p className="mt-2 text-sm text-red-600">
                            {errors.image.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-200 ease-in-out"
                >
                    {isSubmitting ? "Creating..." : "Create Genre"}
                </button>
            </form>
            <Toaster />
        </div>
    );
};

export default GenreForm;
