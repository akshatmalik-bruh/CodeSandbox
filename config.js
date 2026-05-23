import dotenv from "dotenv";

dotenv.config();

export const Port = process.env.PORT || 3000;

export const Database = {
    DB_CONNECTION: process.env.MONGO_URI
};

export const Auth = {
    JWT_SECRET: process.env.JWT_SECRET
};

export default {
    Database,
    Auth,
    Port,
    JWT_SECRET: process.env.JWT_SECRET
};