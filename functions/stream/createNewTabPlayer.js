export function createNewTabPlayer (url, title) {
    const html = `
    <!DOCTYPE html>
    <html lang="ko">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${title}</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/video.js/7.8.1/video-js.min.css" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/video.js/7.8.1/video.min.js"></script>
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-E26S19D0QV"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag() {
                    dataLayer.push(arguments);
                }
                gtag("js", new Date());
                gtag("config", "G-E26S19D0QV");
            </script>
            <style>     
                body, html {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
        
                #player-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
        
                #player {
                    width: 100%;
                    height: auto;
                    min-height: 100%;
                }
            </style>
        </head>
        <body>
            <header>
                <h2>${title}</h2>
                <hr />
                <p><a href="${url}">${url}</a></p>
            </header>
            <section id="player-container">
                <video id="player" class="video-js vjs-default-skin vjs-big-play-centered" />
            </section>
            <script>
                var player = videojs("player", {
                    sources : [{ src : "${url}" }],
                    controls : true,
                });
            </script>
        </body>
    </html>
    `;
    return new Response(html, {
        headers: { "content-type": "text/html" },
    });
};