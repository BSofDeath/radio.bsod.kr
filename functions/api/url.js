import { getUrlCached } from "./method/getUrlCached.js";

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
        // format 파라미터가 없어도 기본적으로 JSON을 반환하도록 수정
        return new Response(JSON.stringify({ url: location }), {
            status: 200,
            headers: {
                "content-type": "application/json",
                "cache-control": "no-store",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }

    return new Response("Bad Request", {
        status: 400,
        headers: { "content-type": "text/plain" },
    });
};