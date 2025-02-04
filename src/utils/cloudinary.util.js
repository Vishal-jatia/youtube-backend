import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation failed
        return null;
    }
};

const deleteFromCloudinary = async (url) => {
    try {
        if(!url) return null
        const public_id = url.split("/").slice(-1)[0].replace(".jpg" || ".png" || ".mp4", "");
        console.log(public_id)
        const response = await cloudinary.uploader.destroy(public_id, {resource_type: "image"})
        if(!response) {
            console.log("url Incorrect");
            return null;
        }
        return response
    } catch (error) {
        return error;
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}