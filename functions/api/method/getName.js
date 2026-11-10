import { kbsUrls } from "../template/kbs.js";
import { mbcUrls } from "../template/mbc.js";
import { sbsUrls } from "../template/sbs.js";
import { ebsUrls } from "../template/ebs.js";
import { tbsUrls } from "../template/tbs.js";
import { tbnUrls } from "../template/tbn.js";
import { cbsUrls } from "../template/cbs.js";
import { febcUrls } from "../template/febc.js";
import { bbsUrls } from "../template/bbs.js";
import { cpbcUrls } from "../template/cpbc.js";
import { wbsUrls } from "../template/wbs.js";
import { kugakUrls } from "../template/kugak.js";
import { afnUrls } from "../template/afn.js";
import { commonUrls } from "../template/common.js";
import { communityUrls } from "../template/community.js";

export async function getName({ station, channel = null, city = null }) {
    const urlMappings = {
      kbs: kbsUrls,
      mbc: mbcUrls,
      sbs: sbsUrls,
      ebs: ebsUrls,
      tbs: tbsUrls,
      tbn: tbnUrls,
      cbs: cbsUrls,
      febc: febcUrls,
      bbs: bbsUrls,
      cpbc: cpbcUrls,
      wbs: wbsUrls,
      kugak: kugakUrls,
      afn: afnUrls,
      community: communityUrls,
    };
    const urls = urlMappings[station] || commonUrls;
    const urlObject =
      urls.find((item) => item.station === station) ||
      urls.find((item) => item.channel === channel && item.city === city) ||
      urls.find((item) => item.channel === channel && item.city === null) ||
      urls.find((item) => item.channel === channel) ||
      urls.find((item) => item.city === city);

    const name = urlObject.name || null;
    return name;
};