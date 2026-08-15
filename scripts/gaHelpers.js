const GA_MEASUREMENT_ID = "G-E26S19D0QV";
const GA_IDS_TIMEOUT_MS = 800;

function fetchGaIds() {
    return new Promise((resolve) => {
        if (typeof gtag !== "function") {
            resolve({ cid: null, sid: null });
            return;
        }

        let settled = false;
        const finish = (result) => {
            if (settled) return;
            settled = true;
            resolve(result);
        };

        const cidPromise = new Promise((res) =>
            gtag("get", GA_MEASUREMENT_ID, "client_id", res)
        );
        const sidPromise = new Promise((res) =>
            gtag("get", GA_MEASUREMENT_ID, "session_id", res)
        );

        Promise.all([cidPromise, sidPromise])
            .then(([cid, sid]) => finish({ cid: cid || null, sid: sid || null }))
            .catch(() => finish({ cid: null, sid: null }));

        setTimeout(() => finish({ cid: null, sid: null }), GA_IDS_TIMEOUT_MS);
    });
}

let cachedGaIdsPromise = null;

function getGaIds() {
    if (!cachedGaIdsPromise) {
        cachedGaIdsPromise = fetchGaIds();
    }
    return cachedGaIdsPromise;
}