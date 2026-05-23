import {z} from "zod";


export const signupValidation = z.object({
    username : z.string().min(3, "Username must be at least 3 characters long").trim(),
    emailid : z.string().email("Invalid email address").trim().toLowerCase(),
    password : z.string().min(6, "Password must be at least 6 characters long")
})

export const signinValidation = z.object({
    emailid : z.string().email("Invalid email address").trim().toLowerCase(),
    password : z.string().min(6, "Password must be at least 6 characters long")
})

