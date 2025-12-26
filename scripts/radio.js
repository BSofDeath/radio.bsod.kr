// 페이지 로드
document.addEventListener("DOMContentLoaded", () => {
    const selector = document.getElementById("citySelector");
    const lastSelectedCity = localStorage.getItem("lastSelectedCity");

    if (lastSelectedCity) selector.value = lastSelectedCity;
    selector.dispatchEvent(new Event("change"));
});

// 도시 선택 기능
document.getElementById("citySelector").addEventListener("change", function () {
    const containers = Array.from(
        document.getElementsByClassName("channelContainer")
    );
    containers.forEach((element) => {
        if (element.id === this.value) element.classList.add("visible");
        else element.classList.remove("visible");
    });
    localStorage.setItem("lastSelectedCity", this.value);
});

// 스트림 변경 및 재생 기능
async function changeSource({ stn, ch = "", city = "" }) {
    const player = document.getElementById("player");
    const nowPlayingTitle = document.getElementById("nowPlayingTitle");
    const nowPlayingUrl = document.getElementById("nowPlayingUrl");
    const staticUrl = document.getElementById("staticUrl");
    const playingCopyBtn = document.getElementById("playingCopyBtn");
    const staticCopyBtn = document.getElementById("staticCopyBtn");

    /* 채널 목록에서 새로 선택한 채널 강조표시 */
    let innerHTMLQuery;
    if (city)
        innerHTMLQuery = ch
            ? `a[href="javascript:changeSource({stn:'${stn}', ch:'${ch}', city:'${city}'})"]`
            : `a[href="javascript:changeSource({stn:'${stn}', city:'${city}'})"]`;
    else
        innerHTMLQuery = ch
            ? `a[href="javascript:changeSource({stn:'${stn}', ch:'${ch}'})"]`
            : `a[href="javascript:changeSource({stn:'${stn}'})"]`;

    const targetChannelContainer =
        document.getElementsByClassName("visible")[0];
    const selectedChannel =
        targetChannelContainer.querySelector(innerHTMLQuery);

    document
        .querySelectorAll(".channel")
        .forEach((item) => item.classList.remove("tuned"));
    selectedChannel.classList.add("tuned");

    /* 플레이어 초기화 */
    player.pause();
    nowPlayingUrl.innerHTML = "";
    nowPlayingUrl.href = "";
    staticUrl.innerHTML = "";
    staticUrl.href = "";
    nowPlayingTitle.innerHTML = "로드 중…";
    playingCopyBtn.style.display = "none";
    staticCopyBtn.style.display = "none";

    /* 새로운 스트림 가져오기 준비 */
    const requestUrl = new URL("https://radio.bsod.kr/stream/");
    requestUrl.searchParams.append("stn", stn);
    if (ch) {
        requestUrl.searchParams.append("ch", ch);
    }
    if (city) {
        requestUrl.searchParams.append("city", city);
    }

    /* 새로운 스트림 가져오기 */
    await fetch(requestUrl, { redirect: "follow" })
        .then((response) => {
            const contentType =
                response.headers.get("Content-Type") === "audio/aacp"
                    ? "audio/aac"
                    : response.headers.get("Content-Type");
            const fetchedUrl = response.url;

            // 정보 업데이트
            nowPlayingTitle.innerHTML = selectedChannel.innerHTML;
            document.title = selectedChannel.innerHTML;
            nowPlayingUrl.innerHTML = fetchedUrl.split("?")[0].toString();
            nowPlayingUrl.href = fetchedUrl;
            staticUrl.innerHTML = requestUrl.toString();
            staticUrl.href = requestUrl;

            // 복사 버튼 이벤트 설정
            playingCopyBtn.style.display = "inline-block";
            playingCopyBtn.onclick = () => {
                navigator.clipboard.writeText(fetchedUrl.toString());
                alert("URL이 클립보드에 복사되었습니다.");
                setTimeout(() => {
                    playingCopyBtn.innerText = "실제 URL 복사";
                }, 1000);
            };
            staticCopyBtn.style.display = "inline-block";
            staticCopyBtn.onclick = () => {
                navigator.clipboard.writeText(requestUrl.toString());
                alert("URL이 클립보드에 복사되었습니다.");
                setTimeout(() => {
                    staticCopyBtn.innerText = "고정 URL 복사";
                }, 1000);
            };

            if (
                contentType.toLowerCase().includes("x-mpegurl") ||
                contentType.toLowerCase().includes("vnd.apple.mpegurl")
            ) {
                // HLS 스트림 처리
                if (Hls.isSupported()) {
                    const hls = new Hls();
                    hls.loadSource(fetchedUrl);
                    hls.attachMedia(player);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        player.play();
                    });
                } else {
                    player.src = fetchedUrl;
                    player.play();
                }
            } else {
                // MPEG 또는 AAC 스트림 처리
                player.src = fetchedUrl;
                player.play();
            }
        })
        .catch((error) => {
            nowPlayingTitle.innerHTML = "재생할 수 없습니다.";
            document.title = "라디오";
            return;
        });
}
