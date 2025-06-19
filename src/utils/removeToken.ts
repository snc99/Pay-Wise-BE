import { redis } from "./redis";

export const removeToken = async (userId: string) => {
  await redis.del(`token:${userId}`);
};
