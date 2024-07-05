import { ApiError } from "../utils/apiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import jwt from "jsonwebtoken";

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

export { registerUser, loginUser, logoutUser, refreshNewAccessToken };
