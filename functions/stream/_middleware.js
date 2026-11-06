// functions/stream/_middleware.js
// /stream/* 요청에만 적용되는 Pages Functions 미들웨어 (정적 파일 요청에는 실행되지 않음)
//
// 기능
//  1) IP별 요청 빈도 감시: 1초 / 10초 윈도우를 넘으면 해당 IP를 일정 시간 밴
//  2) 밴된 IP는 [[path]].js(KV 조회, GA 전송)까지 가지 않고 즉시 403
//  3) 밴이 발생하면 IP/국가/ASN/경로/UA 등 상세 정보를 이메일(Resend)로 발송
//     (선택: Discord/Slack 웹훅 병행)
//  4) (선택) 밴이 발생한 IP를 Cloudflare 계정의 IP 목록(blocked_ips)에 자동 등록
//     → 목록을 참조하는 WAF 규칙 `ip.src in $blocked_ips` 가 영구 차단을 담당
//     (enforce 모드에서만 동작. monitor 모드에서는 목록을 건드리지 않음)
//
// 설정 (Pages → Settings → Variables and Secrets, 모두 선택사항)
//  - RESEND_API_KEY    : Resend API 키 (Secret)
//  - ALERT_EMAIL_FROM  : 발신 주소. Resend에 인증한 도메인이어야 함. 예) "Radio Alert <alert@bsod.kr>"
//  - ALERT_EMAIL_TO    : 수신 주소. 여러 개면 쉼표로 구분
//    (세 값이 모두 있어야 메일이 발송됨. 없으면 메일 없이 차단만)
//  - ALERT_WEBHOOK_URL : (선택) Discord/Slack 웹훅 URL도 함께 받고 싶을 때
//  - GUARD_MODE        : "enforce"(기본) | "monitor". monitor는 차단 없이 경보만 보냄.
//  - GUARD_LIMIT_1S    : 1초 윈도우 한도 (기본 8)
//  - GUARD_LIMIT_10S   : 10초 윈도우 한도 (기본 25)
//  - GUARD_BAN_SEC     : 밴 지속 시간(초) (기본 3600)
//  - CF_API_TOKEN      : Cloudflare API 토큰 (Secret). 권한: Account → Account Filter Lists → Edit
//  - CF_ACCOUNT_ID     : Cloudflare 계정 ID
//  - CF_BLOCKLIST_ID   : IP 목록(blocked_ips)의 ID
//    (세 값이 모두 있어야 목록 자동 등록이 동작함)
//  - GUARD_ALLOWLIST   : (선택) 절대 차단/등록하지 않을 IP. 쉼표로 구분. 예) "1.2.3.4,5.6.7.8"

const DEFAULT_LIMIT_1S = 8;
const DEFAULT_LIMIT_10S = 25;
const DEFAULT_BAN_SEC = 3600;
const ALERT_COOLDOWN_SEC = 600;

// isolate 메모리 안의 IP별 요청 시각 목록 (같은 isolate로 들어오는 요청끼리만 집계됨)
const hits = new Map();
let lastSweep = 0;

function recordAndCount(ip, now) {
    const list = hits.get(ip) ?? [];
    list.push(now);
    // 10초보다 오래된 기록 제거
    while (list.length > 0 && now - list[0] > 10_000) list.shift();
    hits.set(ip, list);

    let in1s = 0;
    for (let i = list.length - 1; i >= 0 && now - list[i] <= 1_000; i--) in1s++;
    return { in1s, in10s: list.length };
}

// 메모리가 무한정 커지지 않도록 가끔 오래된 IP 항목 정리
function sweep(now) {
    if (now - lastSweep < 30_000) return;
    lastSweep = now;
    for (const [ip, list] of hits) {
        if (list.length === 0 || now - list[list.length - 1] > 10_000) hits.delete(ip);
    }
}

// 밴 목록: Cache API (데이터센터 단위로 isolate가 바뀌어도 유지됨)
const banRequest = (ip) => new Request(`https://guard.invalid/ban/${encodeURIComponent(ip)}`);
const alertRequest = (key) => new Request(`https://guard.invalid/alert/${encodeURIComponent(key)}`);

async function putMarker(request, ttlSec) {
    await caches.default.put(
        request,
        new Response("1", { headers: { "Cache-Control": `max-age=${ttlSec}` } })
    );
}

const kst = (ms) => new Date(ms).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

const LISTED_MARKER_TTL_SEC = 86400; // 같은 IP를 하루 안에 중복 등록하지 않도록 하는 표식
const listedRequest = (ip) => new Request(`https://guard.invalid/listed/${encodeURIComponent(ip)}`);

function isAllowlisted(env, ip) {
    if (!env.GUARD_ALLOWLIST) return false;
    return env.GUARD_ALLOWLIST.split(",").some((s) => s.trim() === ip);
}

// Cloudflare IP 목록(blocked_ips)에 IP를 추가. 결과를 사람이 읽을 문장으로 돌려줌(메일에 기록).
async function addToBlocklist(env, ip, reason, cf) {
    if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID || !env.CF_BLOCKLIST_ID) return null; // 미설정
    if (await caches.default.match(listedRequest(ip))) return "이미 등록 요청함 (24시간 내 중복 등록 생략)";

    const comment = `auto ${kst(Date.now())} ${reason} AS${cf.asn ?? "?"} ${cf.asOrganization ?? ""}`.slice(0, 200);
    try {
        const res = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/rules/lists/${env.CF_BLOCKLIST_ID}/items`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${env.CF_API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify([{ ip, comment }]),
            }
        );
        const data = await res.json().catch(() => null);
        if (res.ok && data?.success) {
            await putMarker(listedRequest(ip), LISTED_MARKER_TTL_SEC);
            return "blocked_ips 목록에 추가 요청 완료 (WAF 규칙에 반영되기까지 수 초~수십 초 소요)";
        }
        const msg = data?.errors?.map((e) => `${e.code}: ${e.message}`).join("; ") ?? `HTTP ${res.status}`;
        return `⚠️ 목록 추가 실패 (${msg})`;
    } catch (e) {
        return `⚠️ 목록 추가 실패 (${e?.message ?? "네트워크 오류"})`;
    }
}

async function sendAlert(env, request, ip, reason, counts, banSec, enforce, listResult) {
    const emailReady = env.RESEND_API_KEY && env.ALERT_EMAIL_TO && env.ALERT_EMAIL_FROM;
    if (!emailReady && !env.ALERT_WEBHOOK_URL) return;
    if (await caches.default.match(alertRequest(ip))) return; // 같은 IP 경보는 쿨다운 동안 1회
    await putMarker(alertRequest(ip), ALERT_COOLDOWN_SEC);

    const url = new URL(request.url);
    const cf = request.cf ?? {};
    const h = (name) => request.headers.get(name) ?? "-";
    const now = Date.now();
    const status = enforce
        ? `${Math.round(banSec / 60)}분 차단 (해제 예정: ${kst(now + banSec * 1000)})`
        : "모니터링 모드 (차단하지 않음)";

    const subject = `[radio.bsod.kr] 요청 과다 IP ${enforce ? "차단" : "감지"}: ${ip}`;
    const text = [
        `상태: ${status}`,
        `사유: ${reason} (직전 1초 ${counts.in1s}건 / 10초 ${counts.in10s}건)`,
        `시각: ${kst(now)} (KST)`,
        ``,
        `[IP 정보]`,
        `IP: ${ip}`,
        `국가/지역/도시: ${cf.country ?? "?"} / ${cf.region ?? "?"} / ${cf.city ?? "?"}`,
        `ASN: AS${cf.asn ?? "?"} (${cf.asOrganization ?? "?"})`,
        `Cloudflare 데이터센터: ${cf.colo ?? "?"}`,
        ``,
        `[마지막 요청]`,
        `요청: ${request.method} ${url.pathname}${url.search}`,
        `Host: ${h("host")}`,
        `User-Agent: ${h("user-agent").slice(0, 300)}`,
        `Referer: ${h("referer")}`,
        `Accept-Language: ${h("accept-language")}`,
        ``,
        `[영구 차단]`,
        listResult
            ? `IP 목록 자동 등록: ${listResult}`
            : `IP 목록 자동 등록: 사용 안 함. 영구 차단하려면 blocked_ips 목록에 ${ip} 를 추가하세요.`,
        `잘못 차단된 경우 Cloudflare 대시보드 → Manage Account → Configurations → Lists 에서 해당 IP를 삭제하세요.`,
    ].join("\n");

    const tasks = [];

    if (emailReady) {
        // Resend (https://resend.com) 이메일 API. 발신 도메인(ALERT_EMAIL_FROM)이 인증되어 있어야 함.
        tasks.push(
            fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${env.RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: env.ALERT_EMAIL_FROM,
                    to: env.ALERT_EMAIL_TO.split(",").map((s) => s.trim()).filter(Boolean),
                    subject,
                    text,
                }),
            }).catch(() => {})
        );
    }

    if (env.ALERT_WEBHOOK_URL) {
        tasks.push(
            fetch(env.ALERT_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Discord는 content, Slack은 text 필드를 사용
                body: JSON.stringify({ content: `${subject}\n${text}`, text: `${subject}\n${text}` }),
            }).catch(() => {})
        );
    }

    await Promise.all(tasks);
}

export const onRequest = async (context) => {
    const { request, env, next, waitUntil } = context;

    const ip = request.headers.get("CF-Connecting-IP");
    if (!ip) return next();
    if (isAllowlisted(env, ip)) return next(); // 허용 목록 IP는 집계·차단 모두 제외

    const enforce = (env.GUARD_MODE ?? "enforce") !== "monitor";
    const limit1s = Number(env.GUARD_LIMIT_1S) || DEFAULT_LIMIT_1S;
    const limit10s = Number(env.GUARD_LIMIT_10S) || DEFAULT_LIMIT_10S;
    const banSec = Number(env.GUARD_BAN_SEC) || DEFAULT_BAN_SEC;

    // 0) 이미 밴된 IP는 즉시 차단
    if (enforce && (await caches.default.match(banRequest(ip)))) {
        return new Response("Forbidden", {
            status: 403,
            headers: { "content-type": "text/plain", "Retry-After": String(banSec) },
        });
    }

    // 1) 빈도 집계
    const now = Date.now();
    sweep(now);
    const counts = recordAndCount(ip, now);

    const reason =
        counts.in1s > limit1s
            ? `1초 ${limit1s}건 초과`
            : counts.in10s > limit10s
              ? `10초 ${limit10s}건 초과`
              : null;

    // 2) 한도 초과 → 밴 + 경보
    if (reason) {
        waitUntil(
            (async () => {
                if (enforce) await putMarker(banRequest(ip), banSec);
                // 목록 등록 결과를 메일에 함께 적기 위해 등록 → 메일 순서로 실행
                const listResult = enforce ? await addToBlocklist(env, ip, reason, request.cf ?? {}) : null;
                await sendAlert(env, request, ip, reason, counts, banSec, enforce, listResult);
            })()
        );
        if (enforce) {
            return new Response("Too Many Requests", {
                status: 429,
                headers: { "content-type": "text/plain", "Retry-After": "10" },
            });
        }
    }

    return next();
};