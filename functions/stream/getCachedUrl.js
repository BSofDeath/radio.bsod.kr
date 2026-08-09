import { getUrl } from "./getUrl.js";

const CACHE_TTL_SECONDS = 3600; // 1시간

function buildCacheKey({ station, channel, city, bora }) {
    return `stream:${station ?? ""}:${channel ?? ""}:${city ?? ""}:${bora ?? ""}`;
}

export async function getCachedUrl(params, context) {
    const { env, waitUntil } = context;

    if (!env.RADIO_CACHE) {
        return await getUrl(params);
    }

    const cacheKey = buildCacheKey(params);
    const cached = await env.RADIO_CACHE.get(cacheKey);
    if (cached) return cached;

    const location = await getUrl(params);

    if (location) {
        waitUntil(
            env.RADIO_CACHE.put(cacheKey, location, {
                expirationTtl: CACHE_TTL_SECONDS,
            })
        );
    }

    return location;
}