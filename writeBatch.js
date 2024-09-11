document.getElementById("batch-button").addEventListener("click", function () {
    const selectedCity = document.getElementById("city-select");
    const batContent =
        `@echo off
cd "C:\Program Files\VideoLAN\VLC"
start vlc --sout #transcode{vcodec=none,acodec=mp3,ab=128,channels=2,samplerate=44100,scodec=none}:http{mux=mp3,dst=:8080/} --sout-all --sout-keep "https://radio.bsod.kr/playlist/` +
        selectedCity.value +
        `.m3u"`;

    const blob = new Blob([batContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "vlc-stream_" + selectedCity.value + ".bat";
    a.click();

    document.removeChild(a);
    URL.revokeObjectURL(url);
});
