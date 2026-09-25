// 페이지 로드
document.addEventListener("DOMContentLoaded", function () {
    var selector = document.getElementById("citySelector");
    var lastSelectedCity = null;
    try {
        lastSelectedCity = localStorage.getItem("lastSelectedCity");
    } catch (e) {
        lastSelectedCity = null;
    }

    if (lastSelectedCity) selector.value = lastSelectedCity;

    // 구형 브라우저는 new Event()의 두 번째 인자 없이도 동작하지만,
    // 일부 구형 엔진은 Event 생성자 자체를 지원하지 않으므로 폴백 처리
    var evt;
    if (typeof Event === "function") {
        try {
            evt = new Event("change");
        } catch (e) {
            evt = document.createEvent("Event");
            evt.initEvent("change", true, true);
        }
    } else {
        evt = document.createEvent("Event");
        evt.initEvent("change", true, true);
    }
    selector.dispatchEvent(evt);
});

// 도시 선택 기능
document.getElementById("citySelector").addEventListener("change", function () {
    var containers = document.getElementsByClassName("channelContainer");
    var value = this.value;
    for (var i = 0; i < containers.length; i++) {
        var element = containers[i];
        if (element.id === value) {
            element.className = element.className.indexOf("visible") === -1
                ? element.className + " visible"
                : element.className;
        } else {
            element.className = element.className.replace(/\bvisible\b/g, "").replace(/\s+/g, " ").trim();
        }
    }
    try {
        localStorage.setItem("lastSelectedCity", value);
    } catch (e) {
        // localStorage 사용 불가 시 무시
    }
});

// 현재 재생 중인 Hls 인스턴스를 추적 (채널 전환 시 반드시 destroy 후 새로 생성해야 함)
var currentHls = null;

// 간단한 XHR 기반 fetch 대체 함수
// callback(err, { url: 최종 URL, contentType: string, status: number })
function simpleXhrGet(url, callback) {
    var xhr = new XMLHttpRequest();
    var done = false;

    xhr.open("GET", url, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4 || done) return;
        done = true;

        if (xhr.status < 200 || xhr.status >= 400) {
            callback(new Error("NETWORK_RESPONSE_NOT_OK"));
            return;
        }

        // responseURL은 리다이렉트를 따라간 최종 URL (IE는 미지원 → url로 폴백)
        var finalUrl = xhr.responseURL || url;
        var contentType = "";
        try {
            contentType = xhr.getResponseHeader("Content-Type") || "";
        } catch (e) {
            contentType = "";
        }

        callback(null, { url: finalUrl, contentType: contentType });
    };

    xhr.onerror = function () {
        if (done) return;
        done = true;
        callback(new Error("NETWORK_RESPONSE_NOT_OK"));
    };

    try {
        xhr.send();
    } catch (e) {
        if (!done) {
            done = true;
            callback(e);
        }
    }
}

// 클립보드 복사 (navigator.clipboard 미지원 브라우저 대응)
function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            navigator.clipboard.writeText(text);
            return;
        } catch (e) {
            // 아래 폴백으로 이어짐
        }
    }

    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        document.execCommand("copy");
    } catch (e) {
        // 복사 실패해도 조용히 무시
    }
    document.body.removeChild(textarea);
}

// 쿼리스트링 수동 조립 (URLSearchParams 미지원 대응)
function buildQueryString(params) {
    var pairs = [];
    for (var key in params) {
        if (!Object.prototype.hasOwnProperty.call(params, key)) continue;
        var value = params[key];
        if (value === undefined || value === null || value === "") continue;
        pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    }
    return pairs.join("&");
}

// 스트림 변경 및 재생 기능
function changeSource(opts) {
    opts = opts || {};
    var stn = opts.stn;
    var ch = opts.ch || "";
    var city = opts.city || "";
    var bora = opts.bora || "";

    var player = document.getElementById("player");
    var vPlayer = document.getElementById("vPlayer");

    var nowPlayingTitle = document.getElementById("nowPlayingTitle");
    var nowPlayingUrl = document.getElementById("nowPlayingUrl");
    var staticUrl = document.getElementById("staticUrl");

    var playingCopyBtn = document.getElementById("playingCopyBtn");
    var staticCopyBtn = document.getElementById("staticCopyBtn");
    var resetBtn = document.getElementById("resetBtn");
    var boraBtn = document.getElementById("boraBtn");
    boraBtn.innerHTML = bora === "true" ? "일반 라디오로 전환" : "보이는 라디오로 전환";

    /* 채널 목록에서 새로 선택한 채널 강조표시 */
    var innerHTMLQuery;
    if (city) {
        innerHTMLQuery = ch
            ? "a[href=\"javascript:changeSource({stn:'" + stn + "', ch:'" + ch + "', city:'" + city + "'})\"]"
            : "a[href=\"javascript:changeSource({stn:'" + stn + "', city:'" + city + "'})\"]";
    } else {
        innerHTMLQuery = ch
            ? "a[href=\"javascript:changeSource({stn:'" + stn + "', ch:'" + ch + "'})\"]"
            : "a[href=\"javascript:changeSource({stn:'" + stn + "'})\"]";
    }

    var targetChannelContainer = document.getElementsByClassName("visible")[0];
    var selectedChannel = targetChannelContainer.querySelector(innerHTMLQuery);

    var allChannels = document.querySelectorAll(".channel");
    for (var i = 0; i < allChannels.length; i++) {
        allChannels[i].className = allChannels[i].className.replace(/\btuned\b/g, "").replace(/\s+/g, " ").trim();
    }
    selectedChannel.className = selectedChannel.className.indexOf("tuned") === -1
        ? (selectedChannel.className + " tuned").trim()
        : selectedChannel.className;

    /* 플레이어 초기화 */
    if (currentHls) {
        currentHls.destroy();
        currentHls = null;
    }
    var mediaEls = [player, vPlayer];
    for (var m = 0; m < mediaEls.length; m++) {
        var p = mediaEls[m];
        p.pause();
        p.removeAttribute("src");
        p.load();
        p.style.display = "none";
    }

    /* 스트림 가져오기 준비 */
    var requestUrlStr = "https://" + window.location.host + "/stream";
    var requestParams = { stn: stn, ch: ch, city: city, bora: bora };
    var requestQuery = buildQueryString(requestParams);
    if (requestQuery) requestUrlStr += "?" + requestQuery;

    /* 초기 정보 업데이트 */
    document.title = "▶ 현재 재생 중: " + selectedChannel.innerHTML;
    nowPlayingTitle.innerHTML = selectedChannel.innerHTML;
    staticUrl.style.display = "inline-block";
    staticUrl.innerHTML = requestUrlStr;
    staticUrl.href = requestUrlStr;
    staticCopyBtn.style.display = "inline-block";

    nowPlayingUrl.style.display = "none";
    playingCopyBtn.style.display = "none";
    boraBtn.style.display = "none";

    //초기화 버튼 이벤트 설정
    resetBtn.onclick = function () {
        document.title = "라디오";
        nowPlayingTitle.innerHTML = "채널을 선택해 주세요.";

        nowPlayingUrl.innerHTML = "";
        nowPlayingUrl.href = "";
        nowPlayingUrl.style.display = "none";

        staticUrl.innerHTML = "";
        staticUrl.href = "";
        staticUrl.style.display = "none";

        playingCopyBtn.style.display = "none";
        staticCopyBtn.style.display = "none";
        boraBtn.style.display = "none";

        if (currentHls) {
            currentHls.destroy();
            currentHls = null;
        }
        for (var r = 0; r < mediaEls.length; r++) {
            var rp = mediaEls[r];
            rp.pause();
            rp.removeAttribute("src");
            rp.load();
            rp.style.display = "none";
        }

        selectedChannel.className = selectedChannel.className.replace(/\btuned\b/g, "").replace(/\s+/g, " ").trim();
    };

    /* 스트림 가져오기 */
    function onStreamError() {
        document.title = "라디오";
        nowPlayingTitle.innerHTML +=
            "<br><span style='color:#ff2b4b;'>현재 창에서 해당 채널을 재생할 수 없습니다.<br>브라우저 보안 정책으로 인한 오류일 수 있으니 아래의 <b>고정 URL</b>을 클릭하여 새 창에서 다시 시도해 주세요.</span>";
    }

    function proceedWithFetch(cid, sid) {
        var fetchUrlStr = requestUrlStr;
        var extra = {};
        if (cid) extra.cid = cid;
        if (sid) extra.sid = sid;
        var extraQuery = buildQueryString(extra);
        if (extraQuery) {
            fetchUrlStr += (fetchUrlStr.indexOf("?") === -1 ? "?" : "&") + extraQuery;
        }

        simpleXhrGet(fetchUrlStr, function (err, result) {
            if (err) {
                onStreamError();
                return;
            }

            var fetchedUrl = result.url;
            var contentType = result.contentType || "";

            // [보이는 라디오] 버튼 표시 여부 결정
            var targetChannels = [
                { stn: "kbs", ch: "1radio" },
                { stn: "kbs", ch: "2radio" },
                { stn: "kbs", ch: "3radio" },
                { stn: "kbs", ch: "1fm" },
                { stn: "kbs", ch: "2fm" },
                { stn: "kbs", ch: "hanminjok" },
                { stn: "sbs", ch: "lovefm" },
                { stn: "sbs", ch: "powerfm" },
                { stn: "cbs", ch: "sfm" },
                { stn: "ifm", ch: null }
            ];
            var isTarget = false;
            for (var t = 0; t < targetChannels.length; t++) {
                var item = targetChannels[t];
                if (item.ch != null) {
                    if (item.stn === stn && item.ch === ch) {
                        isTarget = true;
                        break;
                    }
                } else if (item.stn === stn) {
                    isTarget = true;
                    break;
                }
            }

            if (isTarget && city === "") {
                boraBtn.style.display = "inline-block";
                boraBtn.onclick = function () {
                    var isBora = bora === "true" ? "" : "true";
                    if (isBora === "true") boraBtn.innerText = "일반 라디오로 전환";
                    else boraBtn.innerText = "보이는 라디오로 전환";
                    changeSource({ stn: stn, ch: ch, city: city, bora: isBora });
                };
            }

            // 스트림 재생 처리
            var isHLS = contentType.indexOf("mpegurl") !== -1 || fetchedUrl.indexOf(".m3u8") !== -1;

            // iOS Safari 등은 <audio>로 HLS를 네이티브 재생할 수 있으므로
            // hls.js 없이도 바로 재생 가능한 경우 우선 사용
            var nativeHlsSupported =
                typeof player.canPlayType === "function" &&
                player.canPlayType("application/vnd.apple.mpegurl") !== "";

            if (isHLS && typeof Hls !== "undefined" && Hls.isSupported()) {
                var hls = new Hls();
                currentHls = hls;
                hls.loadSource(fetchedUrl);

                hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                    // 이 콜백이 실행되는 시점에 이미 다른 채널로 전환되어 hls가 교체/destroy 되었다면 무시
                    if (currentHls !== hls) return;

                    var hasVideo = false;
                    for (var lv = 0; lv < data.levels.length; lv++) {
                        var level = data.levels[lv];
                        if (
                            level.width > 0 ||
                            (level.videoCodec && level.videoCodec.indexOf("avc1") !== -1) ||
                            (level.attrs && level.attrs.VIDEO)
                        ) {
                            hasVideo = true;
                            break;
                        }
                    }
                    var activePlayer = hasVideo || bora === "true" ? vPlayer : player;
                    activePlayer.style.display = "block";
                    hls.attachMedia(activePlayer);
                    activePlayer.play();
                });
            } else if (isHLS && nativeHlsSupported) {
                // hls.js 미지원(또는 로드 실패)이지만 네이티브 HLS 재생이 가능한 경우
                player.style.display = "block";
                player.src = fetchedUrl;
                player.play();
            } else {
                player.style.display = "block";
                player.src = fetchedUrl;
                player.play();
            }

            // 스트림 가져온 후 정보 업데이트
            nowPlayingUrl.style.display = "inline-block";
            nowPlayingUrl.innerHTML = fetchedUrl.toString();
            nowPlayingUrl.href = fetchedUrl;

            // 복사 버튼 이벤트 설정
            playingCopyBtn.style.display = "inline-block";
            playingCopyBtn.onclick = function () {
                copyTextToClipboard(fetchedUrl.toString());
                alert("URL이 클립보드에 복사되었습니다.");
                setTimeout(function () {
                    playingCopyBtn.innerText = "실제 URL 복사";
                }, 1000);
            };
            staticCopyBtn.style.display = "inline-block";
            staticCopyBtn.onclick = function () {
                copyTextToClipboard(requestUrlStr);
                alert("URL이 클립보드에 복사되었습니다.");
                setTimeout(function () {
                    staticCopyBtn.innerText = "고정 URL 복사";
                }, 1000);
            };
        });
    }

    // 화면에 노출/복사되는 requestUrl은 그대로 두고,
    // 실제 요청에만 GA client_id/session_id를 붙인 별도 URL을 사용
    if (typeof getGaIds === "function") {
        getGaIds().then(
            function (ids) {
                proceedWithFetch(ids && ids.cid, ids && ids.sid);
            },
            function () {
                proceedWithFetch(null, null);
            }
        );
    } else {
        proceedWithFetch(null, null);
    }
}
