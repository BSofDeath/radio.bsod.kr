async function todayBSMBCdatecode () {
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const datecodeMap = {
    "0": "q",
    "1": "h",
    "2": "s",
    "3": "a",
    "4": "g",
    "5": "b",
    "6": "j",
    "7": "c",
    "8": "p",
    "9": "d",
  };
  const strDate = ("" + today.getFullYear()).slice(2, 4)
                + String(today.getMonth() + 1).padStart(2, "0")
                + String(today.getDate()).padStart(2, "0");

  const convertedCode = Array.from(strDate).map((char) => datecodeMap[char] || char).join("");
  
  return convertedCode;
};

export const mbcUrls = [
  /* MBC 표준FM */
  { name: "부산MBC 표준FM", channel: "sfm", city: "busan", streamUrl: async () => {
    return "https://brook.bsmbc.com/live/BusanMBC_AM_onairstream." + await todayBSMBCdatecode() + "/playlist.m3u8"
  } },
  { name: "울산MBC 표준FM", channel: "sfm", city: "ulsan", streamUrl: "https://5ddfd163bd00d.streamlock.net/STDFM/STDFM/playlist.m3u8" },
  { name: "MBC경남 표준FM", channel: "sfm", city: "changwon", streamUrl: "https://wowza.mbcgn.kr/MBCFM/TV2.stream/playlist.m3u8" },
  { name: "대구MBC 표준FM", channel: "sfm", city: "daegu", streamUrl: "https://5ee1ec6f32118.streamlock.net/amradio/am/playlist.m3u8" },
  { name: "안동MBC 표준FM", channel: "sfm", city: "andong", streamUrl: "https://live.andongmbc.co.kr/live/amlive/playlist.m3u8" },
  { name: "포항MBC 표준FM", channel: "sfm", city: "pohang", streamUrl: "http://stream.yubinet.com:1935/live/_definst_/Radio_Am/playlist.m3u8" },
  { name: "광주MBC 표준FM", channel: "sfm", city: "gwangju", streamUrl: "https://media.kjmbc.co.kr/hls/amlive/GWANGJU-MBC-AM/playlist.m3u8" },
  { name: "목포MBC 표준FM", channel: "sfm", city: "mokpo", streamUrl: "https://vod.mpmbc.co.kr/live/encoder-am/playlist.m3u8" },
  { name: "여수MBC 표준FM", channel: "sfm", city: "yeosu", streamUrl: "https://5c3639aa99149.streamlock.net/표준FM/표준FM/playlist.m3u8" },
  { name: "전주MBC 표준FM", channel: "sfm", city: "jeonju", streamUrl: "https://5ee9633b25727.streamlock.net/jmbc_sfm/myStream/playlist.m3u8" },
  { name: "대전MBC 표준FM", channel: "sfm", city: "daejeon", streamUrl: "https://ns1.tjmbc.co.kr/live_am/live_am.stream/playlist.m3u8" },
  { name: "MBC충북 표준FM", channel: "sfm", city: "cheongju", streamUrl: "https://mbccbp.coreit.co.kr/radio_stfm/myStream.sdp/playlist.m3u8" },
  { name: "춘천MBC 표준FM", channel: "sfm", city: "chuncheon", streamUrl: "https://stream.chmbc.co.kr/radio1/fm1_aac/playlist.m3u8" },
  { name: "원주MBC 표준FM", channel: "sfm", city: "wonju", streamUrl: "http://live.wjmbc.co.kr:1935/fm2/fm2/playlist.m3u8" },
  { name: "MBC강원영동 표준FM", channel: "sfm", city: "gangneung", streamUrl: "http://123.254.72.24:1935/amlive/livestream/playlist.m3u8" },
  { name: "제주MBC 표준FM", channel: "sfm", city: "jeju", streamUrl: "https://onairfm.jejumbc.com/hls/onairfmjejumbc/index.m3u8" },
  { name: "MBC 표준FM", channel: "sfm", city: null, streamUrl: async () => {
    try {
      const response = await fetch("https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=sfm");
      const url = await response.text();
      return url;
    } catch (e) { return null; }} },  // default
  /* MBC FM4U */
  { name: "부산MBC FM4U", channel: "fm4u", city: "busan", streamUrl: async () => {
    return "https://brook.bsmbc.com/live/BusanMBC_FM_onairstream." + await todayBSMBCdatecode() + "/playlist.m3u8"
  } },
  { name: "울산MBC FM4U", channel: "fm4u", city: "ulsan", streamUrl: "https://5ddfd163bd00d.streamlock.net/FM4U/FM4U/playlist.m3u8" },
  { name: "MBC경남 FM4U", channel: "fm4u", city: "changwon", streamUrl: "https://wowza.mbcgn.kr/MBCFM4U/TV3.stream/playlist.m3u8" },
  { name: "대구MBC FM4U", channel: "fm4u", city: "daegu", streamUrl: "https://5ee1ec6f32118.streamlock.net/fmradio/fm/playlist.m3u8" },
  { name: "안동MBC FM4U", channel: "fm4u", city: "andong", streamUrl: "https://live.andongmbc.co.kr/live/fmlive/playlist.m3u8" },
  { name: "포항MBC FM4U", channel: "fm4u", city: "pohang", streamUrl: "http://stream.yubinet.com:1935/live/_definst_/Radio_Fm/playlist.m3u8" },
  { name: "광주MBC FM4U", channel: "fm4u", city: "gwangju", streamUrl: "https://media.kjmbc.co.kr/hls/fmlive/GWANGJU-MBC-FM/playlist.m3u8" },
  { name: "목포MBC FM4U", channel: "fm4u", city: "mokpo", streamUrl: "https://vod.mpmbc.co.kr/live/encoder-fm/playlist.m3u8" },
  { name: "여수MBC FM4U", channel: "fm4u", city: "yeosu", streamUrl: "https://5c3639aa99149.streamlock.net/FM4U/FM4U/playlist.m3u8" },
  { name: "전주MBC FM4U", channel: "fm4u", city: "jeonju", streamUrl: "https://5ee9633b25727.streamlock.net/jmbc_fm4u/myStream/playlist.m3u8" },
  { name: "대전MBC FM4U", channel: "fm4u", city: "daejeon", streamUrl: "https://ns1.tjmbc.co.kr/live_fm/live_fm.stream/playlist.m3u8" },
  { name: "MBC충북 FM4U", channel: "fm4u", city: "cheongju", streamUrl: "https://mbccbp.coreit.co.kr/radio_fm/myStream.sdp/playlist.m3u8" },
  { name: "춘천MBC FM4U", channel: "fm4u", city: "chuncheon", streamUrl: "https://stream.chmbc.co.kr/live_radio2/fm1/playlist.m3u8" },
  { name: "원주MBC FM4U", channel: "fm4u", city: "wonju", streamUrl: "http://live.wjmbc.co.kr:1935/fm989/fm989/playlist.m3u8" },
  { name: "MBC강원영동 FM4U", channel: "fm4u", city: "gangneung", streamUrl: "http://123.254.72.24:1935/fmlive/livestream/playlist.m3u8" },
  { name: "제주MBC FM4U", channel: "fm4u", city: "jeju", streamUrl: "https://onairsfm.jejumbc.com/hls/onairsfmjejumbc/1_2/index.m3u8" },
  { name: "MBC FM4U", channel: "fm4u", city: null, streamUrl: async () => {
    try {
      const response = await fetch("https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=mfm");
      const url = await response.text();
      return url;
    } catch (e) { return null; }} },  // default
  /* MBC mini 올댓뮤직 */
  { name: "MBC mini 올댓뮤직", channel: "chm", city: null, streamUrl: async () => {
    try {
      const response = await fetch("https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=chm");
      const url = await response.text();
      return url;
    } catch (e) { return null; }} },  // default
  /* MBC 보이는 라디오 */
  { name: "MBC 보이는 라디오", channel: "bora", city: null, streamUrl: async () => {
    try {
      const response = await fetch("https://sminiplay.imbc.com/boraplay.ashx");
      const url = await response.text();
      return url;
    } catch (e) { return null; }} },  // default
];