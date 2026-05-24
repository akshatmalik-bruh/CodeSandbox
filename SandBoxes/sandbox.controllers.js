import { save } from './sandbox.services.js';
import { autosaveCodeService } from "./code.services.js";

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

export const runCode = async (req,res)=>{
    try{

    }
    catch(err){
        return res.status(500).json({
            message: err.message || 'Failed to run code'
        });
    }
}

export const autosave = async (req, res) => {

  try {

    const { id } = req.params;

    const { content } = req.body;

    const userId = req.user.id;

    const updatedCode = await autosaveCodeService(
      id,
      userId,
      content
    );

    if (!updatedCode) {
      return res.status(404).json({
        message: "Code file not found",
      });
    }

    return res.status(200).json({
      message: "Autosaved successfully",
      code: updatedCode,
    });

  } catch (err) {

    return res.status(500).json({
      message: err.message || "Failed to autosave code",
    });

  }

};
