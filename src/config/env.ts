import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  REDIS_URL: process.env.UPSTASH_REDIS_REST_URL!,
  REDIS_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN!,
  JWT_SECRET: process.env.JWT_SECRET!,
};
