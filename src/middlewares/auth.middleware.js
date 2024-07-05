import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, _, next) => {
    // NOTE (production grade): Since res use nhi ho rha, we can replace it with "_"
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        if(!token) {
            throw new ApiError(401, "Unauthorized request");
        }
        // console.log(process.env.ACCESS_TOKEN_SECRET)
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user) {
            throw new ApiError(401, "Invalid access token")
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})