import madul from "@bsgbryan/madul"

import params from "./params"

const rz = await madul('+RogueZero', params, `${__dirname}/..`)

type TestData = {
  madul: string
}

Bun.serve({
  hostname: params.host,
  port: params.port,
  fetch(req, server) {
    return server.upgrade(req, { data: { madul: new URL(req.url).pathname } }) ?
      new Response("🎉")
      :
      new Response("WebSocket upgrade error", { status: 400 })
  },
  websocket: {
    data: {} as TestData,
    perMessageDeflate: true,
    async open(ws) { await rz.load!({ madul: ws.data.madul }) },
    async message(ws, message) { await rz.handle!({ madul: ws.data.madul, message }) },
    close(ws) { console.log('connection closed') },
  },
});
