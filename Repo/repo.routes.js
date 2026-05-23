import express from "express";
import {
    createRepository,
    getRepositories,
    deleteRepository,
    updateRepository
} from "./repo.controllers.js";
import {
    createRepoValidation,
    updateRepoValidation
} from "./repo.validation.js";
import { middleware } from "../Auth/auth.middlewares.js";
import { middlewareValidation } from "../GlobalConfigs/zodvalidation.js";

const router = express.Router();

router.use(middleware);

router.post("/", middlewareValidation(createRepoValidation), createRepository);
router.get("/", getRepositories);
router.delete("/:id", deleteRepository);
router.put("/:id", middlewareValidation(updateRepoValidation), updateRepository);

export default router;
