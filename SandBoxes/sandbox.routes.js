import express from "express";
import { saveCode } from "./sandbox.controllers.js";
import { saveValidation } from "./sandbox.validation.js";
import { middleware } from "../Auth/auth.middlewares.js";
import { middlewareValidation } from "../GlobalConfigs/zodvalidation.js";

const router = express.Router();

router.use(middleware);

router.post("/save", middlewareValidation(saveValidation), saveCode);

export default router;
