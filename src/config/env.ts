import dotenv from "dotenv";
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";

export const ENV = {
  // 🔹 Mode environment
  NODE_ENV,
  IS_PROD: NODE_ENV === "production",
  IS_DEV: NODE_ENV === "development",

  // 🔹 Server
  SERVER_URL: process.env.SERVER_URL || "http://localhost:3000",

  // 🔹 Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // 🔹 Redis
  REDIS_URL: process.env.UPSTASH_REDIS_REST_URL!,
  REDIS_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN!,

  // 🔹 JWT
  JWT_SECRET: process.env.JWT_SECRET!,

  // 🔹 Swagger info (opsional)
  SWAGGER: {
    TITLE: "Pay Wise Express API",
    VERSION: "1.0.0",
    DESCRIPTION: "API documentation for Pay Wise Express backend",
  },
};
