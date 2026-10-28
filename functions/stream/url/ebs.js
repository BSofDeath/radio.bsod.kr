export const ebsUrls = [
    { name: "EBS FM", channel: "fm", streamUrl: async () => {
        try {
            const response = await fetch("https://www.ebs.co.kr/onair?channelCodeString=radio", { cache: "no-cache" });
            const html = await response.text();
            const url = html.match(/src:\s*'(https:\/\/liveotu\.ebs\.co\.kr\/[^']+)'/);
            return url ? url[1] : "https://ebsonair.ebs.co.kr/fmradiofamilypc/familypc1m/playlist.m3u8";
        } catch (e) { return null; }null;
    }},
    { name: "EBS 반디 외국어 전문", channel: "bandi", streamUrl: "https://ebsonair.ebs.co.kr/cloud1/iradio/playlist.m3u8" },
];