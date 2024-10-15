const { bucket } = require("../../config/firebase");

const uploadTrack = async (file) => {
    const file_name = file.originalname;
    const file_upload = bucket.file(file_name);

    try {
        await file_upload.save(file.buffer, {
            metadata: {
                contentType: file.mimetype,
            },
        });

        const [url] = await file_upload.getSignedUrl({
            action: "read",
            expires: "01-01-3204",
        });

        return url;
    } catch (err) {
        console.log("ERROR: can't upload to bucket", err);
        throw new Error("failed to upload music file to bucket");
    }
};

module.exports = uploadTrack;
