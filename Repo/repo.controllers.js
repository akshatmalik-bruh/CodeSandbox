import * as repoService from "./repo.services.js";

export const createRepository = async (req, res) => {
    try {
        const { reponame } = req.body;
        const userid = req.user.id;
        const repo = await repoService.createRepo(userid, reponame);
        return res.status(201).json({
            success: true,
            message: "Repository created successfully",
            repo
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getRepositories = async (req, res) => {
    try {
        const userid = req.user.id;
        const repos = await repoService.getReposByUserId(userid);
        return res.status(200).json({
            success: true,
            repos
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteRepository = async (req, res) => {
    try {
        const repoId = req.params.id;
        const userid = req.user.id;
        const result = await repoService.deleteRepo(repoId, userid);
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const updateRepository = async (req, res) => {
    try {
        const repoId = req.params.id;
        const userid = req.user.id;
        const { newRepoName } = req.body;
        const repo = await repoService.updateRepo(repoId, userid, newRepoName);
        return res.status(200).json({
            success: true,
            message: "Repository updated successfully",
            repo
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
