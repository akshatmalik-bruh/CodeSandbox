import express from "express";
import {
    autosave,
    getCodeByIdController,
    getFilesByRepoController,
    runCode,
    saveCode,
    getExecutionByIdController
} from "./sandbox.controllers.js";
import {
    autosaveSchema,
    codeParamsSchema,
    executionParamsSchema,
    paramsValidation,
    repoFilesParamsSchema,
    runValidation,
    saveValidation
} from "./sandbox.validation.js";
import { middleware } from "../Auth/auth.middlewares.js";
import { middlewareValidation } from "../GlobalConfigs/zodvalidation.js";
const router = express.Router();

router.use(middleware);

router.post("/save", middlewareValidation(saveValidation), saveCode);

router.get("/files/:repoId", paramsValidation(repoFilesParamsSchema), getFilesByRepoController);
router.get("/code/:codeId", paramsValidation(codeParamsSchema), getCodeByIdController);
router.post("/run", middlewareValidation(runValidation), runCode);
router.patch("/autosave/:id", middlewareValidation(autosaveSchema), autosave);
router.get("/execution/:executionId", paramsValidation(executionParamsSchema), getExecutionByIdController);

export default router;
