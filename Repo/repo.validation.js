import { z } from "zod";

export const createRepoValidation = z.object({
    reponame: z.string().min(3, "Repository name must be at least 3 characters long").trim().toLowerCase()
});

export const updateRepoValidation = z.object({
    newRepoName: z.string().min(3, "Repository name must be at least 3 characters long").trim().toLowerCase()
});
