/* IMPORTS */
import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

/* APP INIT */
const app = express();

/* MIDDLEWARE CONFIG */
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

/* ROUTES IMPORT */
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.route.js";
import commentRouter from "./routes/comment.route.js"

/* ROUTES DECLARATION */
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comment", commentRouter)

/* EXPORTS */
export { app };
