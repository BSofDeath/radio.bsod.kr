import { getUrlCached } from "./getUrlCached.js";
import { getName } from "./getName.js";

export const onRequest = async (context) => {
    const { request, env, ctx } = context;

    const params = new URL(request.url).searchParams;
    const pathname = new URL(request.url).pathname;
    const station = params.get("stn");
    const channel = params.get("ch");
    const city = params.get("city");
    const bora = params.get("bora");

    let location = null;
    let channelTitle = null;

    if (station != null || channel != null || city != null) {
        try {
            location = await getUrlCached(
                { station, channel, city, bora },
                context
            );
            channelTitle = await getName({ station, channel, city });
        } catch (e) {
            location = null;
            channelTitle = null;
        }
    }

    if (location != null) {
        switch (pathname) {
            case "/stream":
                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: location,
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