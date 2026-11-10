import { getUrlCached } from "./getUrlCached.js";

export const onRequest = async (context) => {
    const { request, env, ctx } = context;

    const url = new URL(request.url);
    const params = url.searchParams;
    const pathname = url.pathname;

    const station = params.get("stn");
    const channel = params.get("ch");
    const city = params.get("city");
    const bora = params.get("bora");

    let location = null;

    if (station != null || channel != null || city != null) {
        try {
            location = await getUrlCached(
                { station, channel, city, bora },
                context
            );
        } catch (e) {
            location = null;
        }
    }

    if (location != null) {
        switch (pathname) {
            case "/stream":
                // 대상 스트림 URL로 리다이렉트
                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: location,
                        "Access-Control-Allow-Origin": "*",
                    },
                });
            case "/api/url":
                return new Response(JSON.stringify({ url: location }), {
                    status: 200,
                    headers: {
                        "content-type": "application/json",
                        "cache-control": "no-store",
                        "Access-Control-Allow-Origin": "*",
                    },
                });
        }
    }

    /* 기본값: 400 Bad Request 반환 */
    return new Response("Bad Request", {
        status: 400,
        headers: { "content-type": "text/plain" },
    });
};