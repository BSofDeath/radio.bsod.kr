// ============================================================
// 상태
// ============================================================

// 현재 재생 중인 Hls.js 인스턴스 (있으면 destroy() 필요)
var currentHls = null;

// 채널 전환/초기화 시 늦게 도착한 이전 응답을 무시하기 위한 요청 번호
var requestSeq = 0;

// [보이는 라디오] 버튼을 보여줄 채널 목록
var BORA_CHANNELS = [
    { stn: "kbs", ch: "1radio" },
    { stn: "kbs", ch: "2radio" },
    { stn: "kbs", ch: "1fm" },
    { stn: "kbs", ch: "2fm" },
    { stn: "sbs", ch: "lovefm" },
    { stn: "sbs", ch: "powerfm" },
    { stn: "cbs", ch: "sfm" },
    { stn: "ifm", ch: null }
];


// ============================================================
// 공용 유틸
// ============================================================

function hasClass(el, name) {
    return new RegExp("(^|\\s)" + name + "(\\s|$)").test(el.className);
}

function addClass(el, name) {
    if (!hasClass(el, name)) el.className = (el.className + " " + name).trim();
}

function removeClass(el, name) {
    el.className = el.className
        .replace(new RegExp("(^|\\s)" + name + "(?=\\s|$)", "g"), " ")
        .replace(/\s+/g, " ")
        .trim();
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

// 클립보드 복사 (navigator.clipboard 미지원/거부 시 execCommand로 폴백)
function legacyCopy(text) {
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

function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            navigator.clipboard.writeText(text).then(null, function () {
                legacyCopy(text);
            });
            return;
        } catch (e) {
            // 아래 폴백으로 이어짐
        }
    }
    legacyCopy(text);
}


// ============================================================
// 지역 선택
// ============================================================

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

    // 구형 웹브라우저 대응
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

// 지역 선택 기능
document.getElementById("citySelector").addEventListener("change", function () {
    var containers = document.getElementsByClassName("channelContainer");
    var value = this.value;
    for (var i = 0; i < containers.length; i++) {
        var element = containers[i];
        if (element.id === value) addClass(element, "visible");
        else removeClass(element, "visible");
    }
    try {
        localStorage.setItem("lastSelectedCity", value);
    } catch (e) {
        // localStorage 사용 불가 시 무시
    }
});


// ============================================================
// 채널 목록
// ============================================================

// 보이는 라디오 대상 채널 검증
function isBoraTarget(stn, ch, city) {
    for (var i = 0; i < BORA_CHANNELS.length; i++) {
        var item = BORA_CHANNELS[i];
        if (item.stn !== stn) continue;
        if ((item.city || "") !== city) continue;
        if (item.ch == null || item.ch === ch) return true;
    }
    return false;
}

// 목록에서 해당 채널의 <a> 요소 찾기
function findChannelElement(stn, ch, city) {
    var args = "stn:'" + stn + "'";
    if (ch) args += ", ch:'" + ch + "'";
    if (city) args += ", city:'" + city + "'";
    var query = "a[href=\"javascript:changeSource({" + args + "})\"]";

    var container = document.getElementsByClassName("visible")[0];
    return container ? container.querySelector(query) : null;
}

// 선택한 채널만 강조 (null이면 전체 해제)
function setTunedChannel(selected) {
    var all = document.querySelectorAll(".channel");
    for (var i = 0; i < all.length; i++) removeClass(all[i], "tuned");
    if (selected) addClass(selected, "tuned");
}


// ============================================================
// 플레이어
// ============================================================

// play()가 자동재생 정책 등으로 거부되어도 콘솔 오류가 나지 않도록 처리
function safePlay(el) {
    var result = el.play();
    if (result && typeof result.then === "function") {
        result.then(null, function () {});
    }
}

// 모든 플레이어 정지 및 초기화
function stopPlayers() {
    if (currentHls) {
        currentHls.destroy();
        currentHls = null;
    }
    var mediaEls = [document.getElementById("player"), document.getElementById("vPlayer")];
    for (var i = 0; i < mediaEls.length; i++) {
        var el = mediaEls[i];
        el.pause();
        el.removeAttribute("src");
        el.load();
        el.style.display = "none";
    }
}

// HLS 레벨 목록에 영상이 포함되어 있는지 확인
function hasVideoLevel(levels) {
    for (var i = 0; i < levels.length; i++) {
        var level = levels[i];
        if (
            level.width > 0 ||
            (level.videoCodec && level.videoCodec.indexOf("avc1") !== -1) ||
            (level.attrs && level.attrs.VIDEO)
        ) {
            return true;
        }
    }
    return false;
}

// 스트림 재생 (hls.js / 네이티브 HLS / 일반 스트림 자동 판별)
// opts.onFatalError: 재생 중 복구 불가능한 HLS 오류가 났을 때 호출
// opts.onVideoAvailable(toggle): 매니페스트에 영상 레벨이 있을 때 호출 (hls.js 경로만)
//   toggle()을 호출하면 player(오디오) <-> vPlayer(영상)를 전환하고, 영상 표시 중이면 true를 반환
function playStream(url, bora, opts) {
    opts = opts || {};

    var player = document.getElementById("player");
    var vPlayer = document.getElementById("vPlayer");

    var isHLS = url.indexOf(".m3u8") !== -1;

    // 네이티브 HLS(iOS Safari 등) 지원 여부 확인
    var nativeHls = isHLS && player.canPlayType("application/vnd.apple.mpegurl") !== "";

    if (isHLS && !nativeHls && typeof Hls !== "undefined" && Hls.isSupported()) {
        var hls = new Hls();
        currentHls = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
            // 이미 다른 채널로 전환되어 hls가 교체/destroy 되었다면 무시
            if (currentHls !== hls) return;

            // 가장 높은 비트레이트 레벨로 고정
            var best = 0;
            for (var i = 1; i < data.levels.length; i++) {
                if (data.levels[i].bitrate > data.levels[best].bitrate) best = i;
            }
            hls.currentLevel = best;

            // 기본은 오디오, 보라 요청(bora=true)일 때만 영상으로 시작
            var active = (bora === "true") ? vPlayer : player;
            active.style.display = "block";
            hls.attachMedia(active);
            safePlay(active);

            // 보라 전용 URL이 없는 채널: 영상 레벨이 있으면 같은 스트림으로 전환 가능
            if (opts.onVideoAvailable && hasVideoLevel(data.levels)) {
                opts.onVideoAvailable(function toggle() {
                    if (currentHls !== hls) return false;

                    var next = (active === player) ? vPlayer : player;

                    active.pause();
                    active.style.display = "none";
                    hls.detachMedia();

                    next.style.display = "block";
                    hls.attachMedia(next);
                    safePlay(next);

                    active = next;
                    return active === vPlayer; // 영상 표시 중이면 true
                });
            }
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
            if (currentHls !== hls || !data.fatal) return;
            hls.destroy();
            currentHls = null;
            if (opts.onFatalError) opts.onFatalError();
        });

        hls.loadSource(url);
    } else {
        var active = (bora === "true") ? vPlayer : player;
        active.style.display = "block";

        if (nativeHls && opts.onFatalError) {
            active.onerror = function () {
                active.onerror = null;
                opts.onFatalError();
            };
        }

        active.src = url;
        safePlay(active);
    }
}

// ============================================================
// 스트림 요청
// ============================================================

// 스트림 URL 요청 (서버가 { "url": "..." } JSON으로 응답)
// callback(err, 스트림 URL 문자열)
function fetchStreamUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    var done = false;

    function finish(err, result) {
        if (done) return;
        done = true;
        callback(err, result);
    }

    xhr.open("GET", url, true);
    xhr.setRequestHeader("Accept", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4 || done) return;

        if (xhr.status < 200 || xhr.status >= 300) {
            finish(new Error("NETWORK_RESPONSE_NOT_OK"));
            return;
        }

        var data;
        try {
            data = JSON.parse(xhr.responseText);
        } catch (e) {
            finish(new Error("INVALID_JSON_RESPONSE"));
            return;
        }

        if (!data || typeof data.url !== "string" || !data.url) {
            finish(new Error("INVALID_JSON_RESPONSE"));
            return;
        }

        finish(null, data.url);
    };

    xhr.onerror = function () {
        finish(new Error("NETWORK_RESPONSE_NOT_OK"));
    };

    try {
        xhr.send();
    } catch (e) {
        finish(e);
    }
}

// https 페이지에서 http 스트림은 브라우저가 차단함 (Mixed Content)
function isMixedContent(url) {
    return window.location.protocol === "https:" && /^http:/i.test(url);
}


// ============================================================
// 스트림 변경 및 재생
// ============================================================

function changeSource(opts) {
    opts = opts || {};
    var stn = opts.stn;
    var ch = opts.ch || "";
    var city = opts.city || "";
    var bora = opts.bora || "";

    var nowPlayingTitle = document.getElementById("nowPlayingTitle");
    var nowPlayingUrl = document.getElementById("nowPlayingUrl");
    var playingCopyBtn = document.getElementById("playingCopyBtn");
    var resetBtn = document.getElementById("resetBtn");
    var boraBtn = document.getElementById("boraBtn");
    var newWindowBtn = document.getElementById("newWindowBtn");

    var selectedChannel = findChannelElement(stn, ch, city);
    if (!selectedChannel) return;

    var mySeq = ++requestSeq;

    // 이전 재생 정리 및 선택 채널 강조
    stopPlayers();
    setTunedChannel(selectedChannel);

    // 초기 정보 업데이트
    var channelName = selectedChannel.textContent;
    document.title = channelName + " | 라디오";
    nowPlayingTitle.textContent = channelName;
    nowPlayingUrl.style.display = "none";
    playingCopyBtn.style.display = "none";
    newWindowBtn.style.display = "none";

    // [초기화] 버튼
    resetBtn.onclick = function () {
        requestSeq++; // 진행 중인 요청 무효화

        document.title = "라디오";
        nowPlayingTitle.textContent = "채널을 선택해 주세요.";
        nowPlayingUrl.textContent = "";
        nowPlayingUrl.href = "";
        nowPlayingUrl.style.display = "none";
        playingCopyBtn.style.display = "none";
        newWindowBtn.style.display = "none";
        boraBtn.style.display = "none";

        stopPlayers();
        removeClass(selectedChannel, "tuned");
    };

    // [보이는 라디오] 버튼
    // - BORA_CHANNELS 대상: 보라 전용 URL로 재요청 (기존 방식)
    // - 그 외 채널: 영상 레벨이 감지되면 아래 playStream 콜백에서 버튼을 켬
    var isBora = isBoraTarget(stn, ch, city);
    boraBtn.innerText = bora === "true" ? "일반 라디오로 전환" : "보이는 라디오로 전환";
    if (isBora) {
        boraBtn.style.display = "inline-block";
        boraBtn.onclick = function () {
            changeSource({ stn: stn, ch: ch, city: city, bora: bora === "true" ? "" : "true" });
        };
    } else {
        boraBtn.style.display = "none";
    }

    // 오류 표시 (reason: "mixed"이면 새 창 열기 안내)
    function showError(reason, openUrl) {
        document.title = "라디오";

        var msg = "이 채널은 현재 이용할 수 없습니다.";
        if (reason === "mixed") {
            msg = "이 채널은 새 탭에서만 재생할 수 있습니다.";
            newWindowBtn.style.display = "inline-block";
            newWindowBtn.onclick = function () {
                window.open(openUrl, "_blank");
            };
        }

        var span = document.createElement("span");
        span.style.color = "#ff2b4b";
        span.textContent = msg;
        nowPlayingTitle.appendChild(document.createElement("br"));
        nowPlayingTitle.appendChild(span);
    }

    // 스트림 요청
    var requestUrlStr = "/api/url";
    var requestQuery = buildQueryString({ stn: stn, ch: ch, city: city, bora: bora });
    if (requestQuery) requestUrlStr += "?" + requestQuery;

    fetchStreamUrl(requestUrlStr, function (err, fetchedUrl) {
        if (mySeq !== requestSeq) return; // 이미 다른 채널로 전환/초기화됨

        if (err) {
            showError("generic");
            return;
        }

        nowPlayingUrl.style.display = "inline-block";
        nowPlayingUrl.textContent = fetchedUrl;
        nowPlayingUrl.href = fetchedUrl;

        playingCopyBtn.style.display = "inline-block";
        playingCopyBtn.onclick = function () {
            copyTextToClipboard(fetchedUrl);
            alert("URL이 클립보드에 복사되었습니다.");
        };

        // https 페이지에서 http 스트림이면 새 창 안내, 아니면 재생
        if (isMixedContent(fetchedUrl)) {
            showError("mixed", fetchedUrl);
            return;
        }

        playStream(fetchedUrl, bora, {
            onFatalError: function () {
                if (mySeq === requestSeq) showError("generic");
            },
            // BORA_CHANNELS 대상은 기존 방식이므로 자동 감지에서 제외
            onVideoAvailable: isBora ? null : function (toggle) {
                if (mySeq !== requestSeq) return;
                boraBtn.innerText = "보이는 라디오로 전환";
                boraBtn.style.display = "inline-block";
                boraBtn.onclick = function () {
                    boraBtn.innerText = toggle() ? "일반 라디오로 전환" : "보이는 라디오로 전환";
                };
            }
        });
    });
}