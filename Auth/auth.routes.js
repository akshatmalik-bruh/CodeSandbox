import express from "express";
import { signup, signin } from "./auth.controllers.js";
import { signupValidation, signinValidation } from "./auth.validation.js";
import { middlewareValidation } from "../GlobalConfigs/zodvalidation.js";

const router = express.Router();

router.post("/signup", middlewareValidation(signupValidation), signup);
router.post("/signin", middlewareValidation(signinValidation), signin);

export default router;

