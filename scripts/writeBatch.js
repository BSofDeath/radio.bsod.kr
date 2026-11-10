// 현재 보이는 채널 컨테이너에서 {이름, 스트림 URL} 목록을 만든다
function collectVisibleChannels() {
    var container = document.querySelector(".channelContainer.visible");
    if (!container) return [];

    // [현재 URL]/stream? 의 [현재 URL] 부분 (쿼리/해시/index.html 제거, 끝 슬래시 보장)
    var base = location.href
        .split(/[?#]/)[0]
        .replace(/index\.html$/, "")
        .replace(/\/?$/, "/");

    var entries = [];
    container.querySelectorAll("a.channel").forEach(function (a) {
        var href = a.getAttribute("href") || "";
        var m = href.match(/changeSource\(\{(.*)\}\)/);
        if (!m) return;

        // stn:'kbs', ch:'1radio', city:'humphreys' ... 전부 수집
        var params = new URLSearchParams();
        for (var kv of m[1].matchAll(/(\w+)\s*:\s*'([^']*)'/g)) {
            params.set(kv[1], kv[2]);
        }
        if (!params.has("stn")) return;

        entries.push({
            name: a.textContent.trim(),
            url: base + "stream?" + params.toString(),
        });
    });
    return entries;
}

// m3u 텍스트 생성
function buildM3uLines(entries) {
    var lines = ["#EXTM3U"];
    entries.forEach(function (e) {
        lines.push("#EXTINF:-1," + e.name);
        lines.push(e.url);
    });
    return lines;
}

// cmd echo용 이스케이프 (% 와 특수문자)
function escapeForBat(s) {
    return s.replace(/%/g, "%%").replace(/[\^&<>|()]/g, "^$&");
}

document
    .getElementById("exportBatchBtn")
    .addEventListener("click", function () {
        var entries = collectVisibleChannels();
        if (entries.length === 0) {
            alert("내보낼 채널이 없습니다.");
            return;
        }

        var city = document.querySelector(".channelContainer.visible").id;
        var m3uLines = buildM3uLines(entries);

        var bat = ["@echo off", "chcp 65001 >nul", 'set "M3U=%TEMP%\\radio_' + city + '.m3u"'];

        // 리다이렉트를 앞에 두면 줄 끝이 숫자여도 "1>>" 오작동이 없다
        m3uLines.forEach(function (line, i) {
            bat.push((i === 0 ? ">" : ">>") + '"%M3U%" echo ' + escapeForBat(line));
        });

        bat.push(
            "start vlc --sout #transcode{vcodec=none,acodec=mp3,ab=128,channels=2,samplerate=44100,scodec=none}:http{mux=mp3,dst=:8080/} --sout-all --sout-keep \"%M3U%\""
        );

        // UTF-8 BOM을 붙여 cmd가 한글을 올바르게 읽도록 함
        var blob = new Blob(["\uFEFF" + bat.join("\r\n") + "\r\n"], { type: "text/plain" });
        var url = URL.createObjectURL(blob);

        var a = document.createElement("a");
        a.href = url;
        a.download = "vlc-stream_" + city + ".bat";
        a.click();

        URL.revokeObjectURL(url);
    });