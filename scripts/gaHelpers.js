const GA_MEASUREMENT_ID = "G-E26S19D0QV";
 
function getGaIds() {
    return new Promise((resolve) => {
        if (typeof gtag !== "function") {
            resolve({ cid: null, sid: null });
            return;
        }
        const cidPromise = new Promise((res) =>
            gtag("get", GA_MEASUREMENT_ID, "client_id", res)
        );
        const sidPromise = new Promise((res) =>
            gtag("get", GA_MEASUREMENT_ID, "session_id", res)
        );
        Promise.all([cidPromise, sidPromise]).then(([cid, sid]) =>
            resolve({ cid: cid || null, sid: sid || null })
        );
    });
}