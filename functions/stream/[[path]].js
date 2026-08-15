import { getCachedUrl } from "./getCachedUrl.js";
import { getUrl } from "./getUrl.js";
import { getName } from "./getName.js";
import { createPlsFile } from "./createPlsFile.js";
import { createNewTabPlayer } from "./createNewTabPlayer.js";
import { createProxyResponnse } from "./createProxyResponse.js";

export const onRequest = async (context) => {
    const { request, env, ctx } = context;

    const params = new URL(request.url).searchParams;
    const pathname = new URL(request.url).pathname;
    const station = params.get("stn");
    const channel = params.get("ch");
    const city = params.get("city");
    const bora = params.get("bora");
    const gaClientId = params.get("cid"); // GA client_id
    const gaSessionId = params.get("sid"); // GA session_id

    let location = null;
    let channelTitle = null;

    if (station != null || channel != null || city != null) {
        try {
            location = await getCachedUrl(
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
            // case "/stream/player.html":
            //     return createNewTabPlayer(location, channelTitle);
            // case "/stream/playback.pls":
            //     return createPlsFile(location, channelTitle);
            // case "/stream/static":
            //     return await createProxyResponnse(location, request);
            case "/stream":
                if (env.GA_MEASUREMENT_ID && env.GA_MP_SECRET) {
                    const visitorIp = request.headers.get("CF-Connecting-IP");

                    context.waitUntil(
                        fetch(
                            `https://www.google-analytics.com/mp/collect?measurement_id=${env.GA_MEASUREMENT_ID}&api_secret=${env.GA_MP_SECRET}`,
                            {
                                method: "POST",
                                body: JSON.stringify({
                                    client_id: gaClientId || crypto.randomUUID(),
                                    ...(visitorIp ? { ip_override: visitorIp } : {}),
                                    events: [
                                        {
                                            name: "stream_request",
                                            params: {
                                                stream_id: [station, channel, city].filter(Boolean).join("_"),
                                                channel_name: channelTitle ?? "unknown",
                                                ...(gaSessionId ? { session_id: gaSessionId } : {}),
                                                engagement_time_msec: 1,
                                            },
                                        },
                                    ],
                                }),
                            }
                        )
                    );
                }

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