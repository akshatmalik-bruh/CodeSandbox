import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const saveValidation = z.object({
  repoId: z.string().min(1, "repoId is required"),
  name: z.string().min(1, "name is required"),
  code: z.string().optional(),
  language: z.enum(["javascript", "python", "java", "c++"], {
    errorMap: () => ({ message: "Invalid language" })
  })
});

export const runValidation = z.object({
  repoId: z.string().min(1, "repoId is required"),
  codeId: z.string().min(1, "codeId is required"),
  language: z.enum(["javascript", "python", "java", "c++"], {
    errorMap: () => ({ message: "Invalid language" })
  }),
  codeSnapshot: z.string().min(1, "code is required")
});

export const autosaveSchema = z.object({
  content: z.string()
});

export const repoFilesParamsSchema = z.object({
  repoId: objectId
});

export const codeParamsSchema = z.object({
  codeId: objectId
});

export const executionParamsSchema = z.object({
  executionId: objectId
});

export const paramsValidation = (schema) => {
  return (req, res, next) => {
    const validation = schema.safeParse(req.params);

    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.errors.map((err) => err.message)
      });
    }

    req.params = validation.data;
    next();
  };
};