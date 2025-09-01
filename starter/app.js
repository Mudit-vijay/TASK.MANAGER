import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectdb from "./db/connect.js";
import groupRouter from "./routes/groups.js";
import taskRouter from "./routes/task.js";
// import notFound from "./middleware/error-handler.js";

dotenv.config();

const app = express();

app.use(
    cors({
        // origin: ["https://task-manager-xp1g.onrender.com"],
        origin: "https://localhost:8080/",
        credentials: true,
    })
);

// middleware
app.use(express.static("./public"));
app.use(express.json());

app.use("/api/v1/task", taskRouter);
app.use("/api/v1/group", groupRouter);
// app.use(notFound);

const start = async () => {
    try {
        await connectdb(process.env.MONGO_URI);
        app.listen(3000, () => {
            console.log("server is listening on port 3000");
        });
    } catch (err) {
        console.error(err);
    }
};

start();
