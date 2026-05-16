import madul from "@bsgbryan/madul"

import params from "./params"

const rz = await madul('+RogueZero', params, `${__dirname}/..`)

Bun.serve({
  hostname: 'localhost',
  port: params.port,
  fetch(req, server) {
    const url = new URL(req.url);
    console.log(`upgrade ${url.pathname}!`);
    return server.upgrade(req) ?
      new Response(`Welcome to ${url.pathname}! 🎉`)
      :
      new Response("WebSocket upgrade error", { status: 400 });
  },
  websocket: {
    perMessageDeflate: true,
    open(ws) {
      console.log('connection opened')
    },
    message(ws, message) {
      console.log(`message received: ${message}`)
      console.log('subscriptions', ws.subscriptions); // ["the-group-chat"]
    },
    close(ws) {
      console.log('connection closed')
    },
  },
});
