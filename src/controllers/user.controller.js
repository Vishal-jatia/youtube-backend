import { ApiError } from '../utils/apiError.util.js';
import asyncHandler from '../utils/asyncHandler.util.js';
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.util.js';
import { ApiResponse } from '../utils/apiResponse.util.js';


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
    const {username, fullName, email, password} = req.body;

    // 2. Not empty check
    if([username, fullName, email, password].some((prop) => prop?.trim() == "")) {
        throw new ApiError(400, "All fields are required")
    }

    // 3
    const existingUser = User.findOne({
        $or: [{username}, {email}]
    })

    if(existingUser) {
        throw new ApiError(409, "This user already exists. Please login")
    }

    // 4
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }

    // 5
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(500, "Couldn't add avatar image. Please add again")
    }

    // 6
    const newUser = {
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    }

    const user = await User.create(newUser);

    // 7
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    // 8
    if(!createdUser) {
        throw new ApiError(500, "Failed to create your profile. Please try again!")
    }

    // 9
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
})

export {registerUser};