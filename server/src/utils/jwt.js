import jsonwebtoken from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
        },
        JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
