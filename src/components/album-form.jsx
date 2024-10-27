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
    coverImage: z.custom((value) => {
        return value instanceof FileList && value.length > 0;
    }, "Please upload cover image"),
});

const AlbumForm = () => {
    const [selectedCover, setSelectedCover] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize with null instead of empty string for better value handling
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);

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
            releaseDate: null,
            coverImage: undefined,
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
        // Convert empty string to null for consistency
        const parsedValue = value === "" ? null : Number(value);

        if (type === "month") {
            setSelectedMonth(parsedValue);
        } else if (type === "year") {
            setSelectedYear(parsedValue);
        }

        // Only set the date if both month and year are selected
        const newMonth = type === "month" ? parsedValue : selectedMonth;
        const newYear = type === "year" ? parsedValue : selectedYear;

        if (newMonth !== null && newYear !== null) {
            const newDate = new Date(Date.UTC(newYear, newMonth, 1, 12, 0, 0));
            setValue("releaseDate", newDate);
        }
    };

    const handleCoverChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                setSelectedCover(file);
                const fileList = new DataTransfer();
                fileList.items.add(file);
                setValue("coverImage", fileList.files);
            } else {
                toast.error("Please select a valid image file");
            }
        }
    };

    const onSubmit = async (data) => {
        if (selectedMonth === null || selectedYear === null) {
            toast.error("Please select both month and year");
            return;
        }

        try {
            setIsSubmitting(true);
            let coverUrl;
            try {
                coverUrl = await uploadImage(data.coverImage[0]);
            } catch (err) {
                console.error(err);
                toast.error("Failed to upload the cover image.");
                setIsSubmitting(false);
                return;
            }

            const utcDate = new Date(
                Date.UTC(selectedYear, selectedMonth, 1, 12, 0, 0)
            );

            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/album`,
                {
                    title: data.title,
                    releaseDate: utcDate.toISOString(),
                    coverUrl: coverUrl,
                }
            );

            console.log("Created Album:", response.data.album);
            reset();
            setSelectedCover(null);
            setSelectedMonth(null);
            setSelectedYear(null);
            toast.success("Album Created Successfully");
        } catch (err) {
            console.error(err);
            toast.error("Error creating the album");
        } finally {
            setIsSubmitting(false);
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
                                value={
                                    selectedMonth === null ? "" : selectedMonth
                                }
                                onChange={(e) =>
                                    handleDateChange("month", e.target.value)
                                }
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                            >
                                <option value="">Select Month</option>
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
                                value={
                                    selectedYear === null ? "" : selectedYear
                                }
                                onChange={(e) =>
                                    handleDateChange("year", e.target.value)
                                }
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                            >
                                <option value="">Select Year</option>
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

                    {selectedMonth !== null && selectedYear !== null && (
                        <p className="text-sm text-gray-500">
                            Selected: {months[selectedMonth]} {selectedYear}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Image *
                    </label>
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition duration-200 ${
                            errors.coverImage
                                ? "border-red-300"
                                : "border-gray-300"
                        }`}
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
                                    className={`mx-auto h-12 w-12 ${
                                        errors.coverImage
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
                                        errors.coverImage
                                            ? "text-red-500"
                                            : "text-gray-600"
                                    }`}
                                >
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
                    {errors.coverImage && (
                        <p className="mt-2 text-sm text-red-600">
                            {errors.coverImage.message}
                        </p>
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
