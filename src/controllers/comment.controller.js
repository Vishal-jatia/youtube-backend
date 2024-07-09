import mongoose, { mongo } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Video Id is invalid")
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const matchStage = {
        $match: {
            video: new mongoose.Types.ObjectId(videoId),
        },
    };
    const lookupStage = {
        $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "video_details",
        },
    };

    try {
        const comments = await Comment.aggregatePaginate(
            Comment.aggregate([matchStage]),
            options
        );

        if (!comments) {
            throw new ApiError(400, "Cannot fetch the comments");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, comments, "Comments fetched successfully")
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiResponse(500, null, "Internal Server Error"));
    }
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { commentContent } = req.body;
    const userId = req.user._id;
    /*
    STEPS:-
        1. get user id, video id, and comment Body
        2. create object and save to database
    */

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    if (commentContent?.trim().length == 0) {
        throw new ApiError(401, "Comment should not be empty");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(401, "Invalid video ID");
    }

    const newComment = {
        content: commentContent,
        video: videoId,
        owner: userId,
    };

    const createdComment = await Comment.create(newComment);

    if (!createdComment) {
        throw new ApiError(401, "Cannot create comment");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, createdComment, "Comment created successfully")
        );
});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { commentContent } = req.body;

    if (commentContent?.trim().length == 0) {
        throw new ApiError(401, "Comment should not be empty");
    }

    if (!commentId) {
        throw new ApiError(401, "CommentId is required");
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, {
        $set: {
            content: commentContent,
        },
    }, {new: true});

    if (!updatedComment) {
        throw new ApiError(401, "Cannot update comment");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, updatedComment, "Comment updated successfully")
        );
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(401, "CommentId is required");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new ApiError(401, "Cannot delete comment");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, deletedComment, "Comment deleted successfully")
        );
});

export { getVideoComments, addComment, updateComment, deleteComment };
