// import jwt from "jsonwebtoken";

// export const generateToken = (user: {
//   id: string;
//   role: string;
//   username: string;
// }) => {
//   return jwt.sign(user, process.env.JWT_SECRET!, {
//     expiresIn: "1h",
//   });
// };

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
    expiresIn: "1h",
  });
};

// Fungsi untuk verifikasi token
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};
