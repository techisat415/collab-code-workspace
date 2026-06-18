import prisma from "../prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

export async function registerUser(req, res){
    try{
        const { username, email, name, password } = req.body;
        const hashedPassword = await hashPassword(password);

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                ],
            }
        })

        if(existingUser){
            return res.status(400).json({ error: "User with this email or username already exists" });
        }

        const user = await prisma.user.create({
            data: {
                username,
                email,
                name,
                hashedPassword,
            }
        })
        res.status(201).json({ userId: user.id});
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function loginUser(req, res){
    try{
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if(!user){
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const passwordMatch = await comparePassword(password, user.hashedPassword);
        if(!passwordMatch){
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = generateToken(user);
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        
        return res.json({
            userId: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
        })
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function logoutUser(req, res){
    res.clearCookie("token");
    return res.json({ 
        success: true,
    });
}

export async function getCurrentUser(req, res){
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({ error: "Unauthorized" });
        }

        const decoded = verifyToken(token);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
            }
        });

        if(!user){
            return res.status(401).json({ error: "Unauthorized" });
        }

        res.json({
            userId: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
        });
    }
    catch(err){
        console.error(err);
        res.status(401).json({ error: "Internal server error" });
    }
}