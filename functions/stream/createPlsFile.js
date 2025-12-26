export function createPlsFile (location, title) {
    const pls = `[playlist]\nFile1=${location}\nTitle1=${title}\nLength1=-1`;
    return new Response(pls, {
        headers: { "content-type": "audio/x-scpls" },
    });
};