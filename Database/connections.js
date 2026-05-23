import mongoose from "mongoose";
import { Database } from "../config.js";


const connectDB = async () => {
    try {

        await mongoose.connect(Database.DB_CONNECTION);

        console.log("Database connected successfully");

    } catch (error) {

        console.error("Database connection failed", error);

        process.exit(1);
    }
};

export default connectDB;