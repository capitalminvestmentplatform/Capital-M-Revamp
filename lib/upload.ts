import cloudinary from "@/lib/cloudinary";
import fs from "fs";
import { File } from "formidable";

/**
 * Upload a single file to Cloudinary.
 * @param file - The file object to be uploaded.
 * @param folder - The folder name on Cloudinary where the file will be stored.
 * @returns {string} The URL of the uploaded file.
 */
export const uploadFileToCloudinary = async (file: File, folder: string) => {
  try {
    const upload = await cloudinary.uploader.upload(file.filepath, {
      folder,
      resource_type: "auto", // Supports images, videos, PDFs, etc.
    });
    fs.unlinkSync(file.filepath); // Clean up temp file
    return upload.secure_url;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw new Error("File upload failed");
  }
};

/**
 * Upload multiple files to Cloudinary.
 * @param files - An array of file objects to be uploaded.
 * @param folder - The folder name on Cloudinary where the files will be stored.
 * @returns {string[]} The URLs of the uploaded files.
 */
export const uploadMultipleFilesToCloudinary = async (
  files: File[],
  folder: string
) => {
  try {
    const uploadPromises = files.map((file) =>
      uploadFileToCloudinary(file, folder)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple files to Cloudinary:", error);
    throw new Error("Multiple file upload failed");
  }
};
