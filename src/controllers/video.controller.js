import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.util.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video

    /*
    My checklist: 
        1. Get video and thumbnail local path
        2. upload on cloudinary
        3. get the link along with duration
        4. create a video object and add to db
        5. return response
    */
    if (!title) {
        throw new ApiError(400, "Title for the video is required");
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail are required.");
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!video || !thumbnail) {
        throw new ApiError(
            500,
            "There was an error uploading. Please try again"
        );
    }

    const newVideo = {
        videoFile: video?.url,
        thumbnail: thumbnail?.url,
        owner: req.user._id,
        title,
        description,
        duration: video.duration,
    };

    const createdVideo = await Video.create(newVideo);

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                createdVideo,
                "Your video is published successfully."
            )
        );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Cannot fetch video, invalid link.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Successfully fetched video."));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Cannot fetch, Unauthorized access");
    }

    let thumbnail = video.thumbnail;

    const thumbnailLocalPath = req.file?.path;

    if (thumbnailLocalPath) {
        const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (!newThumbnail) {
            throw new ApiError(
                500,
                "Unable to upload new thumbnail, try again."
            );
        }
        await deleteFromCloudinary(thumbnail);
        thumbnail = newThumbnail;
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.thumbnail = thumbnail?.url || video.thumbnail;

    const response = await video.save({ validateBeforeSave: false, new: true });

    if (!response) {
        throw new ApiError(500, "Unable to update details, try again");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, response, "Video details updated successfully")
        );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findByIdAndUpdate(
        videoId,
        [
            {
                $set: {
                    isPublished: { $eq: [false, "$isPublished"] }
                }
            }
        ],
        { new: true }
    );

    if (!video) {
        throw new ApiError(400, "Cannot get the video");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Toggled publish status successfully")
        );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
