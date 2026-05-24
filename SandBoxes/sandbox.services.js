import Code from "../Database/models/CodeSchema.js";
import Repo from "../Database/models/RepoSchema.js";

export const save = async (
    sourceCode,
    userId,
    repoId,
    language,
    name
) => {
    const repo = await Repo.findOne({
        _id: repoId,
        userid: userId
    });

    if (!repo) {
        throw new Error("Repository not found or unauthorized");
    }

    const existingCode = await Code.findOne({
        userId,
        repoId: repo._id,
        filename: name,
        language
    });

    if (existingCode) {
        throw new Error("File with same name and language already exists");
    }

    try {
        return await Code.create({
            userId,
            repoId: repo._id,
            filename: name,
            content: sourceCode ?? "",
            language
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new Error("File with same name and language already exists");
        }

        throw error;
    }
};



export const autosaveCodeService = async (
  codeId,
  userId,
  content
) => {

  const updatedCode = await Code.findOneAndUpdate(
    {
      _id: codeId,
      userId: userId,
    },
    {
      content,
    },
    {
      new: true,
    }
  );

  return updatedCode;
};

export const getFilesByRepo = async (repoId, userId) => {
    const repo = await Repo.findOne({
        _id: repoId,
        userid: userId
    });

    if (!repo) {
        throw new Error("Repository not found or unauthorized");
    }

    const files = await Code.find({
        repoId: repo._id,
        userId
    }).sort({ updatedAt: -1 });

    return files;
};

export const getCodeById = async (codeId, userId) => {
    const code = await Code.findOne({
        _id: codeId,
        userId
    });
    if (!code) {
        throw new Error("Code file not found or unauthorized");
    }
    return code;
};





