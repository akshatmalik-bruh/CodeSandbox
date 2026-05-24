import express from "express";
import { saveCode } from "./sandbox.controllers.js";
import { saveValidation } from "./sandbox.validation.js";
import { middleware } from "../Auth/auth.middlewares.js";
import { middlewareValidation } from "../GlobalConfigs/zodvalidation.js";
import {runCode} from "./sandbox.controllers.js";
import { runValidation } from "./sandbox.validation.js";
import { autosave } from "./sandbox.controllers.js";
import { autosaveSchema } from "./sandbox.validation.js";
const router = express.Router();

router.use(middleware);

router.post("/save", middlewareValidation(saveValidation), saveCode);

router.post("/run", middlewareValidation(runValidation), runCode);
router.patch("/autosave/:id", middlewareValidation(autosaveSchema), autosave);
export default router;
