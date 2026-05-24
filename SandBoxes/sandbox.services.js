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
        repoid: repoId,
        name,
        language
    });

   

    if (existingCode) {
        if (sourceCode !== undefined) {
            existingCode.code = sourceCode;
        }

        

        return await existingCode.save();
    }

    const payload = {
        userId,
        repoid: repoId,
        name,
        code: sourceCode,
        language
    };

    return await Code.create(payload);
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





