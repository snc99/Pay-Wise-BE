import jwt from "jsonwebtoken";

// Definisikan tipe payload
export type JWTPayload = {
  id: string;
  role: string;
  username: string;
};

// Fungsi untuk generate token
export const generateToken = (user: JWTPayload): string => {
  return jwt.sign(user, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });
};

// Fungsi untuk verifikasi token
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};
