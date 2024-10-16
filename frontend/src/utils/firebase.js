const admin = require("firebase-admin");
const serviceAcc = require("../../.riff-store.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAcc),
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

const uploadTrack = async (file) => {
    const fileName = file.originalname;
    const fileUpload = bucket.file(fileName);

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
        console.log("ERROR: failed to upload music to firebase bucket", err);
        throw new Error("failed to upload music file to firebase bucket");
    }
};

module.exports = uploadTrack;

