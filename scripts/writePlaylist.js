function parseRadioUrl(hrefStr) {
    var match = hrefStr.match(/\{([^}]+)\}/);
    if (!match) return "";

    var paramsStr = match[1];

    var params = {};
    var parts = paramsStr.split(",");
    for (var i = 0; i < parts.length; i++) {
        var kv = parts[i].split(":");
        var key = (kv[0] || "").replace(/^\s+|\s+$/g, "").replace(/['"]/g, "");
        var value = (kv[1] || "").replace(/^\s+|\s+$/g, "").replace(/['"]/g, "");
        params[key] = value;
    }

    var baseUrl = "https://radio.bsod.kr/stream";
    var pairs = [];
    for (var pKey in params) {
        if (!Object.prototype.hasOwnProperty.call(params, pKey)) continue;
        pairs.push(encodeURIComponent(pKey) + "=" + encodeURIComponent(params[pKey]));
    }
    var queryString = pairs.join("&");

    return baseUrl + "?" + queryString;
}

document.getElementById("exportM3UBtn").addEventListener("click", function () {
    var activeContainer = document.querySelector(".channelContainer.visible");

    if (!activeContainer) {
        alert("비정상적인 접근입니다.");
        return;
    }

    var channels = activeContainer.querySelectorAll(".channel");

    var m3u = "#EXTM3U";
    for (var i = 0; i < channels.length; i++) {
        var channel = channels[i];
        var name = channel.innerText.replace(/^\s+|\s+$/g, "");
        var link = parseRadioUrl(channel.getAttribute("href"));
        m3u += "\r\n#EXTINF:-1," + name + "\r\n" + link;
    }

    var blob = new Blob([m3u], { type: "audio/x-mpegurl" });
    var url = URL.createObjectURL(blob);

    var a_dest = document.createElement("a");
    a_dest.href = url;

    a_dest.download = citySelector.value + ".m3u";
    document.body.appendChild(a_dest);
    a_dest.click();

    setTimeout(function () {
        URL.revokeObjectURL(url);
        document.body.removeChild(a_dest);
    }, 100);
});

document.getElementById("exportPLSBtn").addEventListener("click", function () {
    var activeContainer = document.querySelector(".channelContainer.visible");

    if (!activeContainer) {
        alert("비정상적인 접근입니다.");
        return;
    }

    var channels = activeContainer.querySelectorAll(".channel");

    var pls = "[playlist]\n";
    pls += "NumberOfEntries=" + channels.length + "\n\n";
    for (var i = 0; i < channels.length; i++) {
        var channel = channels[i];
        var num = i + 1;
        var name = channel.innerText.replace(/^\s+|\s+$/g, "");
        var link = parseRadioUrl(channel.getAttribute("href"));

        pls += "File" + num + "=" + link + "\n";
        pls += "Title" + num + "=" + name + "\n";
        pls += "Length" + num + "=-1\n\n";
    }
    pls += "Version=2";

    var blob = new Blob([pls], { type: "audio/x-scpls" });
    var url = URL.createObjectURL(blob);

    var a_dest = document.createElement("a");
    a_dest.href = url;
    a_dest.download = citySelector.value + ".pls";

    document.body.appendChild(a_dest);
    a_dest.click();

    setTimeout(function () {
        URL.revokeObjectURL(url);
        document.body.removeChild(a_dest);
    }, 100);
});
