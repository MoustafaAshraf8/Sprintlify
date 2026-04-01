import { KVNamespace } from "@cloudflare/workers-types";

const DEFAULT_TTL = 60 * 5; // 5 minutes

export const cacheGet = async <T>(params: {
  kv: KVNamespace;
  key: string;
}): Promise<T | null> => {
  const { kv, key } = { ...params };

  const cached = await kv.get(key);
  if (!cached) return null;

  return JSON.parse(cached) as T;
};

export const cacheSet = async <T>(params: {
  kv: KVNamespace;
  key: string;
  data: T;
  ttl?: number;
}): Promise<void> => {
  const { kv, key, data, ttl = DEFAULT_TTL } = { ...params };

  await kv.put(key, JSON.stringify(data), { expirationTtl: ttl });
};

export const cacheDel = async (params: {
  kv: KVNamespace;
  key: string;
}): Promise<void> => {
  const { kv, key } = { ...params };

  await kv.delete(key);
};
