//import { Readable } from "stream";
//import { v2 as cloudinary } from "cloudinary";
//
//cloudinary.config({
//    cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
//    api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
//    api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
//});
//
//const bufferToStream = (buffer) => {
//    const readable = new Readable();
//    readable._read = () => {};
//    readable.push(buffer);
//    readable.push(null);
//    return readable;
//};
//
//const uploadImage = (file) => {
//    return new Promise((resolve, reject) => {
//        const stream = cloudinary.uploader.upload_stream(
//            {
//                resource_type: "image",
//                folder: "covers",
//            },
//            (error, result) => {
//                if (error) {
//                    console.error("Cloudinary upload error:", error);
//                    reject(new Error("Failed to upload the image."));
//                } else {
//                    resolve(result.secure_url);
//                }
//            }
//        );
//
//        bufferToStream(file.buffer).pipe(stream); // pipe the buffer to the upload stream
//    });
//};
//
//export default uploadImage;
//
import { useEffect } from "react";

const uploadImage = (callback) => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://upload-widget.cloudinary.com/global/all.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const openWidget = () => {
        window.cloudinary
            .createUploadWidget(
                {
                    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
                    folder: "covers",
                },
                (error, result) => {
                    if (!error && result && result.event === "success") {
                        console.log("Upload successful", result.info);
                        callback(result.info.secure_url);
                    }
                }
            )
            .open();
    };

    return openWidget;
};

export default uploadImage;
