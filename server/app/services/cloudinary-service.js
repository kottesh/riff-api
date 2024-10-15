const cloudinary = require("../../config/cloudinary");

const uploadImage = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(
            file.buffer.toString("base64"),
            {
                resource_type: "image",
                folder: "track_covers",
            }
        );
        return result.secure_url;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to upload the image.");
    }
};

module.exports = uploadImage;
