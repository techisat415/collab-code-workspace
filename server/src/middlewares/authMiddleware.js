import { verifyToken } from "../utils/jwt.js";

export function authMiddleware(req, res, next){
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    }
    catch(err){
        console.error(err);
        res.status(401).json({ error: "Unauthorized" });
    }
}