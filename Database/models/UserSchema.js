import mongoose from "mongoose";
import bcrypt from "bcrypt";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        trim : true
    },
    emailid: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (value) => emailRegex.test(value),
            message: "Please enter a valid email address"
        }, 
        trim : true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    }
    ,
    
},{timestamps : true});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);