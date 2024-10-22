import axios from "axios";
import sha1 from "crypto-js/sha1";

const generateSignature = (paramsToSign) => {
    const signatureString = Object.keys(paramsToSign)
        .sort()
        .map((key) => `${key}=${paramsToSign[key]}`)
        .join("&");

    return sha1(
        signatureString + import.meta.env.VITE_CLOUDINARY_API_SECRET
    ).toString();
};

const uploadImage = async (file) => {
    if (!file) {
        throw new Error("No file provided");
    }

    const timestamp = Math.round(new Date().getTime() / 1000);

    const paramsToSign = {
        timestamp: timestamp,
        folder: "covers",
    };

    const signature = generateSignature(paramsToSign);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);
    formData.append("folder", "covers");

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${
                import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
            }/image/upload`,
            formData
        );

        return response.data.secure_url;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw new Error("Failed to upload the image.");
    }
};

export default uploadImage;
