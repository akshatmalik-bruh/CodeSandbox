import {z} from "zod";


export const middlewareValidation = (schema) => {
    return (req, res, next) => {

        const validation = schema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                errors: validation.error.errors.map(
                    (err) => err.message
                )
            });
        }

        req.body = validation.data;

        next();
    };
};
        