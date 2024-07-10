import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Cannot find the video");
    }
    const userId = req?.user?._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Unauthorized access");
    }

    const findLikes = await Like.findById({
        likedBy: userId,
        video: videoId,
    });

    if (!findLikes) {
        const response = await Like.create({
            likedBy: userId,
            video: videoId,
        });

        return res
            .status(201)
            .json(new ApiResponse(201, response, "Successfully liked."));
    }

    const response = await Like.deleteOne({
        likedBy: userId,
        video: videoId,
    });
    return res
        .status(200)
        .json(new ApiResponse(200, response, "Successfully unliked."));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Cannot find the comment");
    }
    const userId = req?.user?._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Unauthorized access");
    }

    const findLikes = await Like.findById({
        likedBy: userId,
        comment: commentId,
    });

    if (!findLikes) {
        const response = await Like.create({
            likedBy: userId,
            comment: commentId,
        });

        return res
            .status(201)
            .json(
                new ApiResponse(201, response, "Successfully liked comment.")
            );
    }

    const response = await Like.deleteOne({
        likedBy: userId,
        comment: commentId,
    });
    return res
        .status(200)
        .json(new ApiResponse(200, response, "Successfully unliked comment."));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Cannot find the tweet");
    }
    const userId = req?.user?._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Unauthorized access");
    }

    const findLikes = await Like.findById({
        likedBy: userId,
        tweet: tweetId,
    });

    if (!findLikes) {
        const response = await Like.create({
            likedBy: userId,
            tweet: tweetId,
        });

        return res
            .status(201)
            .json(new ApiResponse(201, response, "Successfully liked tweet."));
    }

    const response = await Like.deleteOne({
        likedBy: userId,
        tweet: tweetId,
    });
    return res
        .status(200)
        .json(new ApiResponse(200, response, "Successfully unliked tweet."));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const userId = req?.user?._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Unauthorized request");
    }

    const videos = await Like.findById({ likedBy: userId });

    if (!videos) {
        throw new ApiError(400, "Cannot get videos");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Successfully fetched videos."));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
