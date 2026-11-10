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
    { stn: "kbs", ch: "3radio" },
    { stn: "kbs", ch: "1fm" },
    { stn: "kbs", ch: "2fm" },
    { stn: "kbs", ch: "hanminjok" },
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
    if (city !== "") return false;
    for (var i = 0; i < BORA_CHANNELS.length; i++) {
        var item = BORA_CHANNELS[i];
        if (item.stn !== stn) continue;
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
// onFatalError: 재생 중 복구 불가능한 HLS 오류가 났을 때 호출
function playStream(url, contentType, bora, onFatalError) {
    var player = document.getElementById("player");
    var vPlayer = document.getElementById("vPlayer");

    var isHLS = (contentType || "").indexOf("mpegurl") !== -1 || url.indexOf(".m3u8") !== -1;

    if (isHLS && typeof Hls !== "undefined" && Hls.isSupported()) {
        var hls = new Hls();
        currentHls = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
            // 이미 다른 채널로 전환되어 hls가 교체/destroy 되었다면 무시
            if (currentHls !== hls) return;

            var activePlayer = (bora === "true" || hasVideoLevel(data.levels)) ? vPlayer : player;
            activePlayer.style.display = "block";
            hls.attachMedia(activePlayer);
            safePlay(activePlayer);
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
            if (currentHls !== hls || !data.fatal) return;
            hls.destroy();
            currentHls = null;
            if (onFatalError) onFatalError();
        });

        hls.loadSource(url);
    } else {
        // 네이티브 HLS(iOS Safari 등) 또는 일반 오디오 스트림
        player.style.display = "block";
        player.src = url;
        safePlay(player);
    }
}


// ============================================================
// 스트림 요청
// ============================================================

// 스트림 정보 요청 (서버가 JSON으로 응답)
// callback(err, { url: 스트림 URL, contentType: string })
function fetchStreamInfo(url, callback) {
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

        finish(null, {
            url: data.url,
            contentType: typeof data.contentType === "string" ? data.contentType : ""
        });
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
// 화면 요소
// ============================================================

// [새 창 열기] 버튼 (없으면 복사 버튼 옆에 생성)
function getNewWindowBtn(afterEl) {
    var btn = document.getElementById("newWindowBtn");
    if (!btn) {
        btn = document.createElement("button");
        btn.id = "newWindowBtn";
        btn.type = "button";
        btn.innerText = "새 창 열기";
        btn.className = afterEl.className; // 복사 버튼과 같은 스타일
        btn.style.display = "none";
        afterEl.parentNode.insertBefore(btn, afterEl.nextSibling);
    }
    return btn;
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
    var newWindowBtn = getNewWindowBtn(playingCopyBtn);

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
    boraBtn.innerText = bora === "true" ? "일반 라디오로 전환" : "보이는 라디오로 전환";
    if (isBoraTarget(stn, ch, city)) {
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

        var msg = "현재 스트림을 이용할 수 없습니다.";
        if (reason === "mixed") {
            msg = "해당 채널은 새 창에서 재생할 수 있습니다.";
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
    var requestUrlStr = "/stream";
    var requestQuery = buildQueryString({ stn: stn, ch: ch, city: city, bora: bora, format: "json" });
    if (requestQuery) requestUrlStr += "?" + requestQuery;

    fetchStreamInfo(requestUrlStr, function (err, result) {
        if (mySeq !== requestSeq) return; // 이미 다른 채널로 전환/초기화됨

        if (err) {
            showError("generic");
            return;
        }

        var fetchedUrl = result.url;

        if (isMixedContent(fetchedUrl)) {
            showError("mixed", fetchedUrl);
            return;
        }

        playStream(fetchedUrl, result.contentType, bora, function () {
            if (mySeq === requestSeq) showError("generic");
        });

        nowPlayingUrl.style.display = "inline-block";
        nowPlayingUrl.textContent = fetchedUrl;
        nowPlayingUrl.href = fetchedUrl;

        playingCopyBtn.style.display = "inline-block";
        playingCopyBtn.onclick = function () {
            copyTextToClipboard(fetchedUrl);
            alert("URL이 클립보드에 복사되었습니다.");
        };
    });
}