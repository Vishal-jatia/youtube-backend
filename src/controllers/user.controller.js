import { ApiError } from "../utils/apiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { User } from "../models/user.model.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const generateAccessAndRefreshToken = async (userid) => {
    try {
        const user = await User.findById(userid);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    /*
    STEPS:-
        1. collect data from client
        2. Validation - like not-empty
        3. user already exists
        4. check for image, avatar
        5. upload them to cloudinary, avatar check
        6. create user object - creat entry in db
        7. remove password and refresh token field from response
        8. check for user creation
        9. return response
    */

    // 1
    const { username, fullName, email, password } = req.body;

    // 2. Not empty check
    if (
        [username, fullName, email, password].some((prop) => prop?.trim() == "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // 3
    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) {
        throw new ApiError(409, "This user already exists. Please login");
    }

    // 4
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    // 5
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Couldn't add avatar image. Please add again");
    }

    // 6
    const newUser = {
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    };

    const user = await User.create(newUser);

    // 7
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // 8
    if (!createdUser) {
        throw new ApiError(
            500,
            "Failed to create your profile. Please try again!"
        );
    }

    // 9
    return res
        .status(201)
        .json(
            new ApiResponse(201, createdUser, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    /*
    STEPS:-
        1. collect data from client
        2. Validation - like not-empty
        3. match the credentials - username or email
        4. password check
        5. access and refresh token
        6. send cookie
        7. return response
    */

    // 1
    const { username, email, password } = req.body;

    // 2
    if (!username && !email) {
        throw new ApiError(400, "Email or username is required");
    }

    // 3
    const user = await User.findOne({
        $or: [{ username }, { email }], // either can be used to find user
    });

    if (!user) {
        throw new ApiError(404, "User does not exits");
    }

    // 4
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    // 5
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    // 6
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // cookie options
    const options = {
        httpOnly: true, // only server can modify
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    /*
    STEPS:-
        1. Clear refreshToken from db
        2. Clear cookies
    */

    // 1
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        { new: true }
    );

    // 2
    const options = {
        httpOnly: true, // only server can modify
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshNewAccessToken = asyncHandler(async (req, res) => {
    /*
    STEPS:-
        1. Get refresh token from user(from cookies)
        2. compare it with the one stored on db
        3. If same, generate new access token and return
    */

    // 1
    const userRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!userRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    // 2
    try {
        const decodeToken = jwt.verify(
            userRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodeToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (userRefreshToken !== user?.refreshToken) {
            throw new ApiError(
                401,
                "Refresh token is expired or used. Please login again."
            );
        }

        // 3
        const { accessToken, newRefreshToken } =
            await generateAccessAndRefreshToken(user._id);

        const options = {
            httpOnly: true, // only server can modify
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const createNewPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new Error(400, "Unauthorized access");
    }

    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isOldPasswordCorrect) {
        throw new Error(400, "Old password provided is not correct.");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    console.log(user.password);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "New password created"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user._id,
                "created user fetched successfully"
            )
        );
});

const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName && !email) {
        throw new ApiError(400, "Atleast one of the field is required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName,
                email,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User information updated successfully")
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError("400", "Avatar file is missing. Please reupload");
    }

    const newAvatar = await uploadOnCloudinary(avatarLocalPath);
    if (!newAvatar.url) {
        throw new ApiError(500, "Couldn't add avatar image. Please add again");
    }

    const user = await User.findById(req.user?._id).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(401, "Unauthorized access");
    }

    const oldAvatar = user.avatar;

    user.avatar = newAvatar.url;
    const response = await user.save({ validateBeforeSave: false });

    // remove old image from cloudinary
    await deleteFromCloudinary(oldAvatar);

    return res
        .status(200)
        .json(new ApiResponse(200, response, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(
            "400",
            "Cover Image file is missing. Please reupload"
        );
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(500, "Couldn't add cover image. Please add again");
    }

    const user = await User.findById(req.user?._id).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(401, "Unauthorized access");
    }

    const oldCoverImage = user.coverImage;
    await deleteFromCloudinary(oldCoverImage);

    user.coverImage = coverImage.url;
    const newUser = await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(200, newUser, "Cover Image updated successfully")
        );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribed_to",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelsSubscribedToCount: {
                    $size: "$subscribed_to",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists.");
    }
    console.log("Channel aggregation pipeline: ", channel);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "User channel fetched successfully."
            )
        );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    // nested pipeline
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);

    if (!user?.length) {
        throw new ApiError(400, "Cannot fetch History.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully"
            )
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshNewAccessToken,
    createNewPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
