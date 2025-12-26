export async function createProxyResponnse (location, request) {
    const response = await fetch(location, {
      method: request.method,
      headers: request.headers,
    });
    
    if (!response.ok) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: location,
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
    
    const contentType = response.headers.get('Content-Type');

    const customHeaders = new Headers(response.headers);
    customHeaders.set("Access-Control-Allow-Origin", "*");

    console.log(contentType);
    if (contentType.toLowerCase().includes("x-mpegurl") || contentType.toLowerCase().includes("vnd.apple.mpegurl")) {
      let customText = await response.text();
      customText = customText.replace(/^(?!#)([^\n\r]+)/gm, `${location.replace(/\/[^\/?#]+(?:\?.*)?$/, "")}/$1`);
      return new Response(customText, {
        status: response.status,
        headers: customHeaders,
      });
    }
    return new Response(response.body, {
      status: response.status,
      headers: customHeaders,
    });
}