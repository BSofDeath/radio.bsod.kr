function parseRadioUrl(hrefStr) {
    const match = hrefStr.match(/\{([^}]+)\}/);
    if (!match) return "";

    const paramsStr = match[1];

    const params = {};
    paramsStr.split(",").forEach((part) => {
        const [key, value] = part
            .split(":")
            .map((s) => s.trim().replace(/['"]/g, ""));
        params[key] = value;
    });

    const baseUrl = "https://radio.bsod.kr/stream/";
    const queryString = new URLSearchParams(params).toString();

    return `${baseUrl}?${queryString}`;
}

document.getElementById("exportM3UBtn").addEventListener("click", function () {
    const activeContainer = document.querySelector(".channelContainer.visible");
    const channels = activeContainer.querySelectorAll(".channel");

    if (!activeContainer) {
        alert("비정상적인 접근입니다.");
        return;
    }

    let m3u = "#EXTM3U";
    channels.forEach((channel) => {
        const name = channel.innerText.trim();
        const link = parseRadioUrl(channel.getAttribute("href"));
        m3u += `\r\n#EXTINF:-1,${name}\r\n${link}`;
    });

    const blob = new Blob([m3u], { type: "audio/x-mpegurl" });
    const url = URL.createObjectURL(blob);

    const a_dest = document.createElement("a");
    a_dest.href = url;

    a_dest.download = citySelector.value + ".m3u";
    document.body.appendChild(a_dest);
    a_dest.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a_dest);
    }, 100);
});

document.getElementById("exportPLSBtn").addEventListener("click", function () {
    const activeContainer = document.querySelector(".channelContainer.visible");
    const channels = activeContainer.querySelectorAll(".channel");

    if (!activeContainer) {
        alert("비정상적인 접근입니다.");
        return;
    }

    let pls = "[playlist]\n";
    pls += `NumberOfEntries=${channels.length}\n\n`;
    channels.forEach((channel, index) => {
        const num = index + 1;
        const name = channel.innerText.trim();
        const link = parseRadioUrl(channel.getAttribute("href"));

        pls += `File${num}=${link}\n`;
        pls += `Title${num}=${name}\n`;
        pls += `Length${num}=-1\n\n`;
    });
    pls += "Version=2";

    const blob = new Blob([pls], { type: "audio/x-scpls" });
    const url = URL.createObjectURL(blob);

    const a_dest = document.createElement("a");
    a_dest.href = url;
    a_dest.download = citySelector.value + ".pls";

    document.body.appendChild(a_dest);
    a_dest.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a_dest);
    }, 100);
});
