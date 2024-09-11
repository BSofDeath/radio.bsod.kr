document
    .getElementById("playlist-button")
    .addEventListener("click", function () {
        const selectedCity = document.getElementById("city-select");

        const table = document.querySelector("table.visible");
        const td = table.querySelectorAll("td.channel-name");
        const a = table.querySelectorAll("a.channel-link");

        const channels = [];

        if (td.length === a.length) {
            td.forEach((td_item, index) => {
                const a_item = a[index];
                channels.push({
                    name: td_item.textContent.trim(),
                    link: a_item.href,
                });
            });
        } else {
            console.error("Arrays have different lengths");
        }

        let m3u = "#EXTM3U";
        channels.forEach((item) => {
            m3u += "\n#EXTINF:-1," + item.name;
            m3u += "\n" + item.link;
        });

        const blob = new Blob([m3u], { type: "audio/x-mpegurl" });
        const url = URL.createObjectURL(blob);

        const a_dest = document.createElement("a");
        a_dest.href = url;
        a_dest.download = selectedCity.value + ".m3u";
        document.body.appendChild(a_dest);
        a_dest.click();

        URL.revokeObjectURL(url);
        document.body.removeChild(a_dest);
    });
