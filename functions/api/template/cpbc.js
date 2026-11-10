export const cpbcUrls = [
  /* CPBC 가톨릭평화방송 */
  // { name: "CPBC 가톨릭평화방송", city: null, streamUrl: async () => { 
  //   try {
  //     const response = await fetch("https://apis.cpbc.co.kr/play-api/1.0/onair/channel/radio");
  //     const json = await response.json();
  //     const url = json.onair.source.mediasource.mediaurl;
  //     return url;
  //   } catch (e) { return null; }} },  // default
  { name: "CPBC 가톨릭평화방송", city: null, streamUrl: "http://onair1.cpbc.co.kr:1935/live/_definst_/Instreamer.stream_aac/playlist.m3u8" },
  { name: "CPBC 부산가톨릭평화방송", city: "busan", streamUrl: "http://pbcradio.dynamicsmart.com:1935/radio/bscpbc-radio/index.m3u8" },
  { name: "CPBC 대구가톨릭평화방송", city: "daegu", streamUrl: "http://live.dgcpbc.co.kr/dgcpbclive/livestream/playlist.m3u8" },
  { name: "CPBC 광주가톨릭평화방송", city: "gwangju", streamUrl: "http://pbcradio.dynamicsmart.com:1935/radio/kjpbc2/index.m3u8" },
];