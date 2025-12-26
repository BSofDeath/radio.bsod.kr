import { kbsUrls } from "./url/kbs.js";
import { mbcUrls } from "./url/mbc.js";
import { sbsUrls } from "./url/sbs.js";
import { tbsUrls } from "./url/tbs.js";
import { tbnUrls } from "./url/tbn.js";
import { cbsUrls } from "./url/cbs.js";
import { febcUrls } from "./url/febc.js";
import { bbsUrls } from "./url/bbs.js";
import { cpbcUrls } from "./url/cpbc.js";
import { wbsUrls } from "./url/wbs.js";
import { kugakUrls } from "./url/kugak.js";
import { afnUrls } from "./url/afn.js";
import { commonUrls } from "./url/common.js";
import { communityUrls } from "./url/community.js";

export async function getUrl({
    station,
    channel = null,
    city = null,
    bora = null,
}) {
    const urlMappings = {
        kbs: kbsUrls,
        mbc: mbcUrls,
        sbs: sbsUrls,
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

    if (urlObject) {
        if (typeof urlObject.streamUrl === "function")
            return await urlObject.streamUrl(bora);
        else return urlObject.streamUrl;
    }
    return null;
}
