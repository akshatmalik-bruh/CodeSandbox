import { save } from './sandbox.services.js';

export const saveCode = async (req, res) => {
    try {
        const { repoId, name, code, language } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const savedCode = await save(code, userId, repoId, language, name);

        return res.status(200).json({
            message: 'Code saved successfully',
            data: savedCode
        });
    } catch (error) {
        console.error('Sandbox save error:', error);
        return res.status(500).json({
            message: error.message || 'Failed to save code'
        });
    }
};
