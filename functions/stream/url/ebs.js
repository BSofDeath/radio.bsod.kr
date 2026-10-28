export const ebsUrls = [
    { name: "EBS FM", channel: "fm", streamUrl: async () => {
        try {
            const response = await fetch("https://www.ebs.co.kr/onair?channelCodeString=radio");
            const html = await response.text();
            const match = html.match(/src:\s*'(https:\/\/liveotu\.ebs\.co\.kr\/[^']+)'/);
            return match ? match[1] : null;
        } catch (e) { return null; }
    }},
    { name: "EBS 반디 외국어 전문", channel: "bandi", streamUrl: "https://ebsonair.ebs.co.kr/cloud1/iradio/playlist.m3u8" },
];