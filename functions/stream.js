import { getUrlCached } from "./api/method/getUrlCached.js";

export const onRequest = async (context) => {
    const { request } = context;
    const url = new URL(request.url);
    const params = url.searchParams;

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
        return new Response(null, {
            status: 302,
            headers: {
                Location: location
            },
        });
    }

    return new Response("Bad Request", {
        status: 400,
        headers: { "content-type": "text/plain" },
    });
};