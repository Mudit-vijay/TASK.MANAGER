import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import connectdb from "./db/connect.js";
import groupRouter from "./routes/groups.js";
import taskRouter from "./routes/task.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(compression());

app.use(
    cors({
        origin: (process.env.CORS_ALLOWED_ORIGINS || "https://task-manager-1-5jlg.onrender.com")
            .split(',').map(origin => origin.trim()).filter(Boolean),
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    })
);

// middleware
app.use(express.static("./public"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/task", taskRouter);
app.use("/api/v1/group", groupRouter);

const port = process.env.PORT || 9000;
const start = async () => {
    try {
        await connectdb(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`server is listening on port ${port}`);
        });
    } catch (err) {
        console.log(err);
    }
};

start();
