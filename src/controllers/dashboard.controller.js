import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req?.user?._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Unauthorized Access");
    }

    const totalVideoViews = await Video.aggregate([
        {
            $match: {
                owner: userId,
            },
        },
        {
            $project: {
                views: 1,
            },
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
            },
        },
    ]);

    const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: userId,
            },
        },
        {
            $group: {
                _id: null,
                totalSubscribers: {
                    $sum: 1,
                },
            },
        },
    ]);

    const totalVideoLikes = await Video.aggregate([
        {
            $match: {
                owner: userId,
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes",
                pipeline: [
                    {
                        $group: {
                            _id: null,
                            totalLikes: {
                                $sum: 1
                            }
                        }
                    }
                ]
            }
        }
    ]);

    if (!totalVideoLikes) {
        throw new ApiError(400, "Cannot get total views");
    }
    // const totalVideoViews = videoViews.map((video) => {return sum(video.views)})
    return res
        .status(200)
        .json(new ApiResponse(200, totalVideoLikes, "Successfully got views"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req?.user?._id;

    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Unauthorized access");
    }

    const allVideos = await Video.aggregate([
        {
            $match: {
                owner: userId
            }
        }
    ])

    if(!allVideos) {
        throw new ApiError(400, "Cannot fetch all videos")
    }

    return res.status(200).json(new ApiResponse(200, allVideos, "Successfully fetched all videos"))
});

export { getChannelStats, getChannelVideos };
