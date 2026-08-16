import { getUrl } from "./getUrl.js";

const CACHE_TTL_SECONDS = 43140; // 약 11시간 59분
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function buildCacheKey({ station, channel, city, bora }) {
    return `stream:${station ?? ""}:${channel ?? ""}:${city ?? ""}:${bora ?? ""}`;
}

// 부산MBC 스트림인 경우 특별 만료 적용 대상인지 판단 (다음날 00:01까지)
function isSpecialExpiryTarget({ station, channel, city }) {
    return (
        station === "mbc" &&
        city === "busan" &&
        (channel === "sfm" || channel === "fm4u")
    );
}

// 현재 시각(UTC) 기준으로, KST 기준 "다음날 00:01"까지 남은 초(seconds)를 계산
function getSecondsUntilNextKstMidnightOne(now = new Date()) {
    const kstNow = new Date(now.getTime() + KST_OFFSET_MS);

    // kstNow의 UTC 기준 필드를 그대로 "KST의 벽시계 시각"으로 취급
    const kstYear = kstNow.getUTCFullYear();
    const kstMonth = kstNow.getUTCMonth();
    const kstDate = kstNow.getUTCDate();

    // KST 기준 "다음날 00:01:00" 을 UTC epoch(ms)로 환산
    // 1) KST 벽시계로 다음날 00:01:00 을 UTC 필드값처럼 만든 뒤
    // 2) KST_OFFSET_MS 만큼 빼서 실제 UTC epoch로 변환
    const targetKstAsUtcFields = Date.UTC(
        kstYear,
        kstMonth,
        kstDate + 1,
        0,
        1,
        0,
        0
    );
    const targetEpochMs = targetKstAsUtcFields - KST_OFFSET_MS;

    const diffMs = targetEpochMs - now.getTime();
    return Math.max(1, Math.ceil(diffMs / 1000));
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
        const expirationTtl = isSpecialExpiryTarget(params)
            ? getSecondsUntilNextKstMidnightOne()
            : CACHE_TTL_SECONDS;

        waitUntil(
            env.RADIO_CACHE.put(cacheKey, location, {
                expirationTtl,
            })
        );
    }

    return location;
}