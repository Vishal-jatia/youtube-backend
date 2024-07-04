import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
                default: [],
            },
        ],
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true, // make searching less expensive and fast - INDEX BASED SEARCHING
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: [true, "Must be all lowercase"],
            trim: true,
        },
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // cloudinary URL
            unique: true,
        },
        coverImage: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// HOOK or MIDDLEWARE
userSchema.pre("save", async function (next) {
    // to prevent hashing password for every kind of change in User
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// METHODS
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = model("User", userSchema);
