import { Router } from "express";
import {
    createNewPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshNewAccessToken,
    registerUser,
    updateUserAvatar,
    updateUserCoverImage,
    updateUserDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/* ROUTES */
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

/* SECURED ROUTES */
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshToken").post(refreshNewAccessToken);
router.route("/createNewPassword").post(verifyJWT, createNewPassword);
router.route("/getCurrentUser").get(verifyJWT, getCurrentUser);
router.route("/updateUserDetails").patch(verifyJWT, updateUserDetails);
router.route("/updateUserAvatar").patch(
    verifyJWT, // middleware 1
    upload.single("avatar"), // middleware 2
    updateUserAvatar
);
router
    .route("/updateUserCoverImage")
    .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
router.route("/watchHistory").get(verifyJWT, getWatchHistory);

export default router;
