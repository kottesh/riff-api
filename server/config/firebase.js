const admin = require("firebase-admin");
const serviceAcc = require("../.riff-store.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAcc),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

module.exports = {
    admin,
    bucket,
};
