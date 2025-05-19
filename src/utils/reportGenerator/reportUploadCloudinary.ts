import cloudinary from "cloudinary";
import streamifier from "streamifier";

export const uploadBufferTOCloudinary = (
    buffer: Buffer,
    publicId: string,
    resourceType: "raw" | "image" = "raw"
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
            {
                public_id: publicId,
                resource_type: resourceType,
                folder: "wellcare/doctor-reports",
            },
            (error, result) => {
                if (error) return reject(error);

                if (!result || !result.secure_url) return reject("Upload failed");
                resolve(result.secure_url);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};
