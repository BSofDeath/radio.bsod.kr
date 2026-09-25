var GA_MEASUREMENT_ID = "G-E26S19D0QV";
var GA_IDS_TIMEOUT_MS = 800;

function fetchGaIds() {
    return new Promise(function (resolve) {
        if (typeof gtag !== "function") {
            resolve({ cid: null, sid: null });
            return;
        }

        var settled = false;
        function finish(result) {
            if (settled) return;
            settled = true;
            resolve(result);
        }

        var cid = null;
        var sid = null;
        var doneCount = 0;

        function checkDone() {
            doneCount += 1;
            if (doneCount >= 2) {
                finish({ cid: cid || null, sid: sid || null });
            }
        }

        try {
            gtag("get", GA_MEASUREMENT_ID, "client_id", function (value) {
                cid = value;
                checkDone();
            });
            gtag("get", GA_MEASUREMENT_ID, "session_id", function (value) {
                sid = value;
                checkDone();
            });
        } catch (e) {
            finish({ cid: null, sid: null });
        }

        setTimeout(function () {
            finish({ cid: null, sid: null });
        }, GA_IDS_TIMEOUT_MS);
    });
}

var cachedGaIdsPromise = null;

function getGaIds() {
    if (!cachedGaIdsPromise) {
        cachedGaIdsPromise = fetchGaIds();
    }
    return cachedGaIdsPromise;
}
