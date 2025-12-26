export const afnUrls = [
    /* AFN The Eagle */
    { name: "AFN FM Humphreys", city: "humphreys", streamUrl: async () => {
        const response = await fetch("https://playerservices.streamtheworld.com/api/livestream?station=AFNP_OSN&transports=http%2Chls&version=1.10");
        const text = await response.text();
        const urls = [...text.matchAll(/<ip>(.*?)<\/ip>/g)].map(match => match[1]);
        return `https://${urls.reverse()[0] || "14613.live.streamtheworld.com"}/AFNP_OSNAAC.aac`;
    }},
    { name: "AFN FM Daegu", city: "daegu", streamUrl: async () => {
        const response = await fetch("https://playerservices.streamtheworld.com/api/livestream?station=AFNP_DGU&transports=http%2Chls&version=1.10");
        const text = await response.text();
        const urls = [...text.matchAll(/<ip>(.*?)<\/ip>/g)].map(match => match[1]);
        return `https://${urls.reverse()[0] || "14943.live.streamtheworld.com"}/AFNP_DGUAAC.aac`;
    }},
    { name: "AFN FM Kunsan", city: "kunsan", streamUrl: async () => {
        const response = await fetch("https://playerservices.streamtheworld.com/api/livestream?station=AFNP_KSN&transports=http%2Chls&version=1.10");
        const text = await response.text();
        const urls = [...text.matchAll(/<ip>(.*?)<\/ip>/g)].map(match => match[1]);
        return `https://${urls.reverse()[0] || "21633.live.streamtheworld.com"}/AFNP_KSNAAC.aac`;
    }}
];