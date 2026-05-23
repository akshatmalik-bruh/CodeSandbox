import jwt from "jsonwebtoken";
import User from "../Database/models/UserSchema.js";
import { Auth } from "../config.js";

export const generateToken = (userId, emailid, username) => {
    return jwt.sign(
        { id: userId, emailid, username },
        Auth.JWT_SECRET,
        { expiresIn: "24h" }
    );
};

export const registerUser = async (username, emailid, password) => {
    const existingEmail = await User.findOne({ emailid });
    if (existingEmail) {
        throw new Error("Email is already registered");
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        throw new Error("Username is already taken");
    }

    const user = new User({ username, emailid, password });
    await user.save();

    const token = generateToken(user._id, user.emailid, user.username);

    return {
        user: {
            id: user._id,
            username: user.username,
            emailid: user.emailid
        },
        token
    };
};

export const loginUser = async (emailid, password) => {
    const user = await User.findOne({ emailid });
    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    const token = generateToken(user._id, user.emailid, user.username);

    return {
        user: {
            id: user._id,
            username: user.username,
            emailid: user.emailid
        },
        token
    };
};
