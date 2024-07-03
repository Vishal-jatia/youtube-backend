import mongoose, { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // cloudinary URL
            required: [true, "Video file URL is required"],
            unique: true,
        },
        thumbnail: {
            type: String,
            required: [true, "Thumbnail URL is required"],
            unique: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner ID is required"],
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            unique: true,
        },
        description: {
            type: String,
            unique: true,
        },
        duration: {
            type: Number,
            required: [true, "Duration is required"],
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = model("Video", videoSchema);