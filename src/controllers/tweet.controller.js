import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { tweetContent } = req.body;
    const userId = req?.user?._id;

    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Unauthorized access")
    }
    if(!tweetContent || tweetContent.trim().length === 0) {
        throw new ApiError(400, "Tweet is required to be added")
    }

    const newTweet = await Tweet.create({
        owner: userId,
        content: tweetContent
    })

    if(!newTweet) {
        throw new ApiError(400, "Failed to create a new tweet");
    }
    return res.status(201).json(new ApiResponse(201, newTweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;

    const matchStage = {
        $match: {
            owner: new mongoose.Types.ObjectId(userId)
        }
    }

    const tweets = await Tweet.aggregate([matchStage]);

    if(!tweets) {
        throw new ApiError(400, "Failed to fetch tweets");
    }
    return res.status(201).json(new ApiResponse(201, tweets, "Tweet fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {tweetContent} = req.body
    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet id is invalid");
    }

    if(!tweetContent || tweetContent.trim().length === 0) {
        throw new ApiError(400, "Tweet is required");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, {
        $set: {
            content: tweetContent
        }
    }, {new: true})

    if(!updatedTweet) {
        throw new ApiError(400, "Failed to update new tweet");
    }

    return res.status(201).json(new ApiResponse(201, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet id is invalid");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deletedTweet) {
        throw new ApiError(400, "Failed to update new tweet");
    }

    return res.status(201).json(new ApiResponse(201, deletedTweet, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
