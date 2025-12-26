const channelCodes = [
    { name: "1라디오", code: "21", param: "1radio" },
    { name: "2라디오", code: "22", param: "2radio" },
    { name: "3라디오", code: "23", param: "3radio" },
    { name: "1FM", code: "24", param: "1fm" },
    { name: "2FM", code: "25", param: "2fm" },
    { name: "한민족방송", code: "26", param: "hanminjok" },
];
const cityCodes = [
    { name: "KBS부산", code: "10_", param: "busan" },
    { name: "KBS창원", code: "20_", param: "changwon" },
    { name: "KBS진주", code: "21_", param: "jinju" },
    { name: "KBS대구", code: "30_", param: "daegu" },
    { name: "KBS안동", code: "31_", param: "andong" },
    { name: "KBS포항", code: "32_", param: "pohang" },
    { name: "KBS광주", code: "40_", param: "gwangju" },
    { name: "KBS목포", code: "41_", param: "mokpo" },
    { name: "KBS순천", code: "43_", param: "suncheon" },
    { name: "KBS전주", code: "50_", param: "jeonju" },
    { name: "KBS대전", code: "60_", param: "daejeon" },
    { name: "KBS청주", code: "70_", param: "cheongju" },
    { name: "KBS춘천", code: "80_", param: "chuncheon" },
    { name: "KBS강릉", code: "81_", param: "gangneung" },
    { name: "KBS원주", code: "82_", param: "wonju" },
    { name: "KBS제주", code: "90_", param: "jeju" },
];

const createApiUrl = ({channelCode, cityCode = null}) => {
    return `https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/${cityCode || ""}${channelCode}`;
};

export const kbsUrls = [];

const setupKbsUrls = async () => {
    for (const chItem of channelCodes) {
        kbsUrls.push({
            name: `KBS ${chItem.name}`,
            channel: chItem.param,
            city: null,
            streamUrl: async () => {
                try {
                    const response = await fetch(createApiUrl({channelCode: chItem.code}));
                    const json = await response.json();
                    return json.channel_item[0]?.service_url || null;
                } catch (e) {}
            },
        });

        for (const cityItem of cityCodes) {
            if (chItem.param === "1radio" || chItem.param === "2radio" || chItem.param === "1fm") {
                kbsUrls.push({
                    name: `${cityItem.name} ${chItem.name === "1FM" ? "음악FM" : chItem.name}`,
                    channel: chItem.param,
                    city: cityItem.param,
                    streamUrl: async () => {
                        try {
                            const response = await fetch(createApiUrl({channelCode: chItem.code, cityCode: cityItem.code}));
                            const json = await response.json();
                            return json.channel_item[0]?.service_url || null;
                        } catch (e) {}
                    },
                });
            }
        }
    }
};

setupKbsUrls();