import madul from "@bsgbryan/madul"

import params from "./params"

type TestData = {
  madul: string
}

const main = async () => {
  const args = await params()
  const rz = await madul('+RogueZero', args, `${__dirname}/..`)

  Bun.serve({
    hostname: args.host,
    port: args.port,
    fetch(req, server) {
      return server.upgrade(req, { data: { madul: new URL(req.url).pathname } }) ?
        new Response("🎉")
        :
        new Response("WebSocket upgrade error", { status: 400 })
    },
    websocket: {
      data: {} as TestData,
      perMessageDeflate: true,
      async open(ws) {
        await rz.load!({ madul: ws.data.madul })
        console.log('connection opened', ws.data.madul)
      },
      async message(ws, message) { await rz.handle!({ madul: ws.data.madul, message, server: ws }) },
      close(ws) { console.log('connection closed', ws.data.madul) },
    },
  })
}

main()
