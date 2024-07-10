import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Cannot find the channel");
    }
    const userId = req?.user?._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Unauthorized access");
    }

    const findSubscription = await Subscription.findById({
        subscriber: userId,
        channel: channelId,
    });
    if (!findSubscription) {
        const response = await Subscription.create({
            subscriber: userId,
            channel: channelId,
        });

        return res
            .status(201)
            .json(new ApiResponse(201, response, "Successfully subscribed."));
    }

    const response = await Subscription.deleteOne({
        subscriber: userId,
        channel: channelId,
    });
    return res
            .status(200)
            .json(new ApiResponse(200, response, "Successfully unsubscribed."));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Cannot find the channel");
    }

    const matchStage = {
        $match: {
            channel: channelId
        }
    }

    const subscribers = await Subscription.aggregate([matchStage]);

    if(!subscribers) {
        throw new ApiError(400, "Cannot fetch the subscribers")
    }

    return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Cannot find the user");
    }

    const matchStage = {
        $match: {
            subscriber: subscriberId
        }
    }

    const channels = await Subscription.aggregate([matchStage]);

    if(!channels) {
        throw new ApiError(400, "Cannot fetch the channels")
    }

    return res.status(200).json(new ApiResponse(200, channels, "Channels fetched successfully"))
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
