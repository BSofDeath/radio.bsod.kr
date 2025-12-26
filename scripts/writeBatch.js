document
    .getElementById("exportBatchBtn")
    .addEventListener("click", function () {
        const batContent =
            `@echo off
start vlc --sout #transcode{vcodec=none,acodec=mp3,ab=128,channels=2,samplerate=44100,scodec=none}:http{mux=mp3,dst=:8080/} --sout-all --sout-keep "https://radio.bsod.kr/playlist/` +
            citySelector.value +
            `.m3u"`;

        const blob = new Blob([batContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "vlc-stream_" + citySelector.value + ".bat";
        a.click();

        URL.revokeObjectURL(url);
    });
