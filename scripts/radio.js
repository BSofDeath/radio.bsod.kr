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
async function changeSource({ stn, ch = "", city = "", bora = "" }) {
    const player = document.getElementById("player");
    const vPlayer = document.getElementById("vPlayer");

    const nowPlayingTitle = document.getElementById("nowPlayingTitle");
    const nowPlayingUrl = document.getElementById("nowPlayingUrl");
    const staticUrl = document.getElementById("staticUrl");

    const playingCopyBtn = document.getElementById("playingCopyBtn");
    const staticCopyBtn = document.getElementById("staticCopyBtn");
    const boraBtn = document.getElementById("boraBtn");
    boraBtn.innerHTML =
        bora === "true" ? "일반 라디오로 전환" : "보이는 라디오로 전환";

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
    [player, vPlayer].forEach((p) => {
        p.pause();
        p.removeAttribute("src");
        p.load();
        p.style.display = "none";
    });

    nowPlayingUrl.innerHTML = "";
    nowPlayingUrl.href = "";
    nowPlayingTitle.innerHTML = "연결 중…";

    staticUrl.innerHTML = "";
    staticUrl.href = "";

    playingCopyBtn.style.display = "none";
    staticCopyBtn.style.display = "none";
    boraBtn.style.display = "none";

    /* 새로운 스트림 가져오기 준비 */
    const requestUrl = new URL("https://radio.bsod.kr/stream/");
    requestUrl.searchParams.append("stn", stn);
    if (ch) {
        requestUrl.searchParams.append("ch", ch);
    }
    if (city) {
        requestUrl.searchParams.append("city", city);
    }
    if (bora) {
        requestUrl.searchParams.append("bora", bora);
    }

    try {
        const response = await fetch(requestUrl, { redirect: "follow" });
        const fetchedUrl = response.url;
        const contentType = response.headers.get("Content-Type") || "";

        // [보이는 라디오] 버튼 표시 여부 결정
        const targetChannels = ["1radio", "2radio", "2fm"];
        if (targetChannels.includes(ch) && city === "") {
            boraBtn.style.display = "inline-block";
            boraBtn.onclick = () => {
                const isBora = bora === "true" ? "" : "true";
                if (isBora === "true") boraBtn.innerText = "일반 라디오로 전환";
                else boraBtn.innerText = "보이는 라디오로 전환";
                changeSource({ stn: stn, ch: ch, city: city, bora: isBora });
            };
        }

        // 스트림 재생 처리
        const isHLS =
            contentType.includes("mpegurl") || fetchedUrl.includes(".m3u8");
        if (isHLS && Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(fetchedUrl);

            hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                const hasVideo = data.levels.some((level) => {
                    return (
                        level.width > 0 ||
                        (level.videoCodec &&
                            level.videoCodec.includes("avc1")) ||
                        (level.attrs && level.attrs.VIDEO)
                    );
                });
                const activePlayer =
                    hasVideo || bora === "true" ? vPlayer : player;
                activePlayer.style.display = "block";
                hls.attachMedia(activePlayer);
                activePlayer.play();
            });
        } else {
            player.style.display = "block";
            player.src = fetchedUrl;
            player.play();
        }

        // 정보 업데이트
        nowPlayingTitle.innerHTML = selectedChannel.innerHTML;
        document.title = selectedChannel.innerHTML;

        nowPlayingUrl.innerHTML = fetchedUrl.split("?")[0].toString();
        staticUrl.innerHTML = requestUrl.toString();

        nowPlayingUrl.href = fetchedUrl;
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
    } catch (error) {
        nowPlayingTitle.innerHTML = "재생할 수 없습니다.";
        document.title = "라디오";
        return;
    }
}
