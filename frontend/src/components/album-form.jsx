import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast, Toaster } from "sonner";
import uploadImage from "../utils/cloudinary";

const albumSchema = z.object({
    title: z.string().min(1, "Album title is required"),
    releaseDate: z.date({
        required_error: "Release date is required",
        invalid_type_error: "That's not a valid date!",
    }),
    coverImage: z.instanceof(FileList).optional(),
});

const AlbumForm = () => {
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({
        resolver: zodResolver(albumSchema),
        defaultValues: {
            title: "",
            releaseDate: new Date(),
        },
    });

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const handleDateChange = (type, value) => {
        if (type === "month") {
            setSelectedMonth(value);
        } else {
            setSelectedYear(value);
        }
        const newDate = new Date(
            selectedYear,
            type === "month" ? value : selectedMonth
        );
        setValue("releaseDate", newDate);
    };

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            let coverUrl = null;
            if (data.coverImage?.[0]) {
                try {
                    coverUrl = await uploadImage(data.coverImage[0]);
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to upload the cover image.");
                    setIsSubmitting(false);
                    return;
                }
            }
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/album`,
                {
                    title: data.title,
                    releaseDate: data.releaseDate.toISOString(),
                    coverUrl: coverUrl,
                }
            );
            console.log("Created Album:", response.data.album);
            reset();
            setImagePreview(null);
            setSelectedMonth(new Date().getMonth());
            setSelectedYear(new Date().getFullYear());
            toast.success("Album Created Successfully");
        } catch (err) {
            console.error(err);
            toast.error("Error creating the album");
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
                Add New Album
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Album Title *
                    </label>
                    <input
                        id="title"
                        type="text"
                        {...register("title")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                    />
                    {errors.title && (
                        <p className="mt-2 text-sm text-red-600">
                            {errors.title.message}
                        </p>
                    )}
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Release Date *
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="month"
                                className="block text-sm text-gray-600 mb-1"
                            >
                                Month
                            </label>
                            <select
                                id="month"
                                value={selectedMonth}
                                onChange={(e) =>
                                    handleDateChange(
                                        "month",
                                        parseInt(e.target.value)
                                    )
                                }
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                            >
                                {months.map((month, index) => (
                                    <option key={month} value={index}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="year"
                                className="block text-sm text-gray-600 mb-1"
                            >
                                Year
                            </label>
                            <select
                                id="year"
                                value={selectedYear}
                                onChange={(e) =>
                                    handleDateChange(
                                        "year",
                                        parseInt(e.target.value)
                                    )
                                }
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {errors.releaseDate && (
                        <p className="text-sm text-red-600">
                            {errors.releaseDate.message}
                        </p>
                    )}

                    <p className="text-sm text-gray-500">
                        Selected: {months[selectedMonth]} {selectedYear}
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="coverImage"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Cover Image
                    </label>
                    <input
                        id="coverImage"
                        type="file"
                        accept="image/*"
                        {...register("coverImage")}
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
                    {isSubmitting ? "Creating..." : "Create Album"}
                </button>
            </form>
            <Toaster />
        </div>
    );
};

export default AlbumForm;
