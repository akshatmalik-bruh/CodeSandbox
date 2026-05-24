import Repo from "../Database/models/RepoSchema.js";
import Code from "../Database/models/CodeSchema.js";

export const createRepo = async (userid, reponame) => {
    try {
        const repo = await Repo.create({
            userid,
            reponame
        });
        return repo;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error("Repository with same name already exists");
        }
        throw error;
    }
};

export const getReposByUserId = async (userid) => {
    const repos = await Repo.find({ userid }).lean();
    return repos;
};

export const deleteRepo = async (repoId, userid) => {
    const repo = await Repo.findOne({
        _id: repoId,
        userid
    });
    if (!repo) {
        throw new Error("Repository not found or unauthorized");
    }
    await Code.deleteMany({
        repoId: repo._id
    });
    await Repo.deleteOne({
        _id: repo._id
    });
    return {
        message: "Repository deleted successfully"
    };
};

export const updateRepo = async (repoId, userid, newRepoName) => {
    const repo = await Repo.findOne({
        _id: repoId,
        userid
    });
    if (!repo) {
        throw new Error("Repository not found or unauthorized");
    }
    repo.reponame = newRepoName;
    try {
        await repo.save();
        return repo;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error("Repository with same name already exists");
        }
        throw error;
    }
};

