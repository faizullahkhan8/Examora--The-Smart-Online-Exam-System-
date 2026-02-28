import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import expressSession from "express-session";
import MongoStore from "connect-mongo";

import connectDB from "./config/db.ts";

import authRouter from "./routers/auth.router.ts";
import instituteRouter from "./routers/institute.router.ts";
import userRouter from "./routers/user.router.ts";
import messengerRouter from "./routers/messenger.router.ts";
import { ErrorHandler } from "./middlewares/error.middleware.ts";

dotenv.config();
const app = express();
app.use(express.json());

app.use(
    cors({
        origin: [process.env.FRONTEND_URL || ""],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    }),
);

app.use(
    expressSession({
        name: "connect.sid",
        secret: process.env.SESSION_SECRET || "secret",
        store: new MongoStore({
            mongoUrl: process.env.MONGO_URL || "",
            collectionName: "session",
        }),
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        },
    }),
);

app.get("/", (_, res) => {
    res.status(200).json({
        success: true,
        message: "Wellcome to the API server.",
    });
});

app.use("/api/auth", authRouter);
app.use("/api/institutes", instituteRouter);
app.use("/api/users", userRouter);
app.use("/api/messenger", messengerRouter);

connectDB();

app.use(ErrorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
