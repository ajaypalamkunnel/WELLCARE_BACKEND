import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

export const uploadBufferToCloudinary = (buffer: Buffer, filename: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: "raw",
                public_id: `admin_reports/${filename}`,
                folder: "admin_reports",
            },
            (error, result) => {
                if (error) reject(error);

                if (!result || !result.secure_url) return reject("Upload failed")

                resolve(result.secure_url)
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
};
