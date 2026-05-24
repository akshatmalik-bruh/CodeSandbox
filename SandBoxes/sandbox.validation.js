import { z } from "zod";

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
  name: z.string().min(1, "name is required"),
  code: z.string().min(1, "code is required"),
  language: z.enum(["javascript", "python", "java", "c++"], {
    errorMap: () => ({ message: "Invalid language" })
  })
});


export const autosaveSchema = z.object({
   content: z.string()
});