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

    let location = null;
    let channelTitle = null;

    if (station != null || channel != null || city != null) {
        try {
            location = await getUrl({
                station: station,
                channel: channel,
                city: city,
            });
            channelTitle = await getName({
                station: station,
                channel: channel,
                city: city,
            });
        } catch (e) {
            location = null;
            channelTitle = null;
        }
    }

    if (location != null) {
        switch (pathname) {
            case "/stream/player.html":
                return createNewTabPlayer(location, channelTitle);
            case "/stream/playback.pls":
                return createPlsFile(location, channelTitle);
            case "/stream/static":
                return await createProxyResponnse(location, request);
            default:
                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: location,
                        "Access-Control-Allow-Origin": "*", // CORS 헤더 추가
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
