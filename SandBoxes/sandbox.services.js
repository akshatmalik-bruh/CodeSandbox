import Code from "../Database/models/CodeSchema.js";
import Repo from "../Database/models/RepoSchema.js";
import Execution from "../Database/models/ExecutionSchema.js";
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


export const Runsave = async (
  userId,
  repoId,
  language,
  codeSnapshot,
  codeId
) => {

  const existingExecution = await Execution.findOne({
    codeId,
    userId,
    language,
    codeSnapshot,
    status: "completed",
  });

  if (existingExecution) {
    return existingExecution;
  }

  const execution = await Execution.create({
    userId,
    repoId,
    codeId,
    language,
    codeSnapshot,
    status: "queued",
  });

  return execution;
};

export const updateExecutionResult = async (
  executionId,
  output,
  error,
  status,
  executionTime
) => {

  const updation = {};

  if (output !== undefined) {
    updation.output = output;
  }

  if (error !== undefined) {
    updation.error = error;
  }

  if (status !== undefined) {
    updation.status = status;
  }

  if (executionTime !== undefined) {
    updation.executionTime = executionTime;
  }

  const execution = await Execution.findByIdAndUpdate(
    executionId,
    updation,
    { new: true }
  );

  if (!execution) {
    throw new Error("Execution not found");
  }

  return execution;
};

export const getAllExecution = async(repoId,userId,codeId) => {
    const executions = await Execution.find({
        repoId,
        userId,
        codeId
    }).sort({ createdAt: -1 });
    
    return executions;

}
export const getExecutionById = async (executionId, userId) => {

  const execution = await Execution.findOne({
    _id: executionId,
    userId,
  });
  if (!execution) {
    throw new Error("Execution not found or unauthorized");
  }
  return execution;
};
