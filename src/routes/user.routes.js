import { Router } from "express";
import {
    createNewPassword,
    getCurrentUser,
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
router.route("/updateUserDetails").post(verifyJWT, updateUserDetails);
router.route("/updateUserAvatar").post(
    verifyJWT, // middleware 1
    upload.single("avatar"), // middleware 2
    updateUserAvatar
);
router.route("/updateUserCoverImage").post(
    verifyJWT, 
    upload.single("coverImage"),
    updateUserCoverImage
);

export default router;
