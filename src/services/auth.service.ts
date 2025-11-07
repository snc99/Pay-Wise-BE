import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../prisma/client";
import { redis } from "../utils/redis";
import { generateToken } from "../utils/jwt";
import { ENV } from "../config/env";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: Role;
  };
}

export const loginService = async (
  username: string,
  password: string
): Promise<LoginResponse | null> => {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return null;

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) return null;

  const token = generateToken({
    id: admin.id,
    role: admin.role,
    username: admin.username,
  });

  const decoded = jwt.decode(token) as { exp: number };
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);

  await redis.set(`token:${admin.id}`, token, { ex: ttl });

  if (ENV.IS_DEV) {
    console.log(`[DEV] Login success for: ${admin.username}`);
  }

  return {
    token,
    user: {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};
