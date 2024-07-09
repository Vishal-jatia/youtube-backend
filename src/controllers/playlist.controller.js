import mongoose, { isValidObjectId, mongo } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    //TODO: create playlist

    if (name?.trim().length === 0) {
        throw new ApiError(400, "Name is required");
    }
    const userId = req?.user?._id;

    if(!userId) {
        throw new ApiError(400, "Unauthorized access");
    }
    const newPlaylist = {
        name,
        description,
        videos: [],
        owner: userId
    };

    const createdPlaylist = await Playlist.create(newPlaylist);

    if(!createdPlaylist) {
        throw new ApiError(400, "Cannot create playlist")
    }

    return res.status(201).json(new ApiResponse(201, createdPlaylist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    //TODO: get user playlists

    if(!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user");
    }

    const matchStage = {
        $match: {
            owner: new mongoose.Types.ObjectId(userId)
        }
    }

    const playlists = await Playlist.aggregate([matchStage]);

    if(!playlists) {
        throw new ApiError(400, "Cannot fetch Playlist");
    }

    return res.status(200).json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    //TODO: get playlist by id

    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(400, "Cannot fetch Playlist");
    }
    return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $push: {videos: videoId}
    }, {new: true})

    if(!updatePlaylist) {
        throw new ApiError(400, "Cannot add video to the playlist");
    }

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"));

});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    // TODO: remove video from playlist

    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull: {videos: videoId}
    }, {new: true})

    if(!updatePlaylist) {
        throw new ApiError(400, "Cannot remove video from the playlist");
    }

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    // TODO: delete playlist
    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if(!deletedPlaylist) {
        throw new ApiError(400, "Cannot remove playlist");
    }
    return res.status(200).json(new ApiResponse(200, deletedPlaylist, "Removed playlist successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    //TODO: update playlist
    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $set: {
            name: name,
            description: description
        }
    }, {new: true})

    if(!updatedPlaylist) {
        throw new ApiError(400, "Cannot update playlist");
    }
    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
