export const get = (params: URLSearchParams, headers: Headers) =>
  `You got me!
  I got params: ${[...params.entries().map(([k, v]) => `${k}: ${v}`)].join(", ")}
  with headers: ${JSON.stringify(headers, null, 2)}`
