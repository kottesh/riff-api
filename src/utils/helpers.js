export const calcDuration = (file) => {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        const objectUrl = URL.createObjectURL(file);

        audio.addEventListener("loadedmetadata", () => {
            // duration in seconds
            resolve(Math.round(audio.duration));
            URL.revokeObjectURL(objectUrl);
        });

        audio.addEventListener("error", (error) => {
            reject(error);
            URL.revokeObjectURL(objectUrl);
        });

        audio.src = objectUrl;
    });
};

export const extractFileName = (fileName) => {
    return fileName
        .replace(/\.[^/.]+$/, "") // remove extension
        .replace(/[-_]/g, " ") // replace hyphens and underscores with spaces
        .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize first letter of each word
};
