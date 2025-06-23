import { Redis } from "@upstash/redis";
import { ENV } from "../config/env";

// console.log("Redis URL:", process.env.UPSTASH_REDIS_REST_URL);
// console.log("Redis Token:", process.env.UPSTASH_REDIS_REST_TOKEN);

export const redis = new Redis({
  url: ENV.REDIS_URL,
  token: ENV.REDIS_TOKEN,
});
