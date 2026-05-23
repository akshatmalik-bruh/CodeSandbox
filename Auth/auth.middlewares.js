import jwt from "jsonwebtoken";
import { Auth } from "../config.js";


export const middleware = (req,res,next) => {
    
    try{
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, Auth.JWT_SECRET);
    req.user = decoded;
    next();


}
catch(error){
    
    return res.status(401).json({ message: "Unauthorized" });
}
}
