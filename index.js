import express from "express";
import cors from "cors";
import { Port } from "./config.js";
import helmet from "helmet";
import connectDB from "./Database/connections.js";
import authRoutes from "./Auth/auth.routes.js";
import repoRoutes from "./Repo/repo.routes.js";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
    res.status(200).json({
        "health": "Everything is fine !"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/repo", repoRoutes);

app.listen(Port, () => {
    console.log(`Listening on Port : ${Port}`);
});
