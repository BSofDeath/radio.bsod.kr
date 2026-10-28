const MOCK_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "ko-KR,ko;q=0.9",
};

export const ebsUrls = [
    { name: "EBS FM", channel: "fm", streamUrl: async () => {
        try {
            const response = await fetch("https://www.ebs.co.kr/onair?channelCodeString=radio", { headers: HEADERS });
            const html = await response.text();
            const match = html.match(/src:\s*'(https:\/\/liveotu\.ebs\.co\.kr\/[^']+)'/);
            return match ? match[1] : null;
        } catch (e) {
            return null;
        }
    }},
    { name: "EBS 반디 외국어 전문", channel: "bandi", streamUrl: "https://ebsonair.ebs.co.kr/cloud1/iradio/playlist.m3u8" },
];