export const sbsUrls = [
  /* SBS 러브FM */
  { name: "KNN 러브FM", channel: "lovefm", city: "busan", streamUrl: "https://stream1.knn.co.kr/hls/b3y26uu6471k8tes9w7h_lfm/index.m3u8" },
  { name: "SBS 러브FM", channel: "lovefm", city: null, streamUrl: async (bora = null) => {
    try {
      const response = bora == "true" 
      ? "https://apis.sbs.co.kr/play-api/1.0/livestream/visuallove/visuallove4?protocol=hls&ssl=Y"
      : "https://apis.sbs.co.kr/play-api/1.0/livestream/lovepc/lovefm?protocol=hls&ssl=Y";
      const url = await response.text();
      return url;
    } catch (e) { return null; }} },  // default
  /* SBS 파워FM */
  { name: "KNN 파워FM", channel: "powerfm", city: "busan", streamUrl: "https://stream1.knn.co.kr/hls/lb9ezl87d37uu0vy65bb_pfm/index.m3u8" },
  { name: "UBC 그린FM", channel: "powerfm", city: "ulsan", streamUrl: "https://stream.ubc.co.kr/hls/ubcfmstream/index.m3u8" },
  { name: "TBC 드림FM", channel: "powerfm", city: "daegu", streamUrl: "http://203.251.91.227:6888/live/radio-eorn-xlqltl-dbekftks-001/stream.m3u8" },
  { name: "KBC 마이FM", channel: "powerfm", city: "gwangju", streamUrl: "https://vod.ikbc.co.kr/KBCFM/kbcra_aac/playlist.m3u8" },
  { name: "JTV 매직FM", channel: "powerfm", city: "jeonju", streamUrl: "http://61.85.197.53:1935/jtv_radio/myStream/playlist.m3u8" },
  { name: "TJB 파워FM", channel: "powerfm", city: "daejeon", streamUrl: "https://vod.tjb.co.kr/radiolive/_definst_/radio_64k/playlist.m3u8" },
  { name: "CJB 조이FM", channel: "powerfm", city: "cheongju", streamUrl: "https://wowza1.cjb.co.kr/live/cjbradio/playlist.m3u8" },
  { name: "G1 프레쉬FM", channel: "powerfm", city: "chuncheon", streamUrl: "http://61.82.49.4:1935/fm/_definst_/myStream/playlist.m3u8" },
  { name: "JIBS 뉴파워FM", channel: "powerfm", city: "jeju", streamUrl: "http://123.140.197.22/stream/2/play.m3u8" },
  { name: "SBS 파워FM", channel: "powerfm", city: null, streamUrl: async (bora = null) => {
    try {
      const response = bora == "true"
      ? "https://apis.sbs.co.kr/play-api/1.0/livestream/visualpower/visualpower4?protocol=hls&ssl=Y"
      : "https://apis.sbs.co.kr/play-api/1.0/livestream/powerpc/powerfm?protocol=hls&ssl=Y";
      const url = await response.text();
      return url;
    } catch (e) { return null; }} },  // default
  /* 고릴라디오M */
  { name: "SBS 고릴라디오M", channel: "dmb", city: null, streamUrl: async () => {
    try {
      const response = await fetch("https://apis.sbs.co.kr/play-api/1.0/livestream/sbsdmbpc/sbsdmb?protocol=hls&ssl=Y");
      const url = await response.text();
      return url;
    } catch (e) { return null; }} },  // default
];