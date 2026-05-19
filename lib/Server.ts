import type { BufferSource } from "bun"
import { randomUUIDv7 } from "bun"

import madul from "@bsgbryan/madul"

import params from "./params"

type TestData = {
  session_id: string
}

const main = async () => {
  const args = await params()
  const rz = await madul('+RogueOne', args, `${__dirname}/..`)

  Bun.serve({
    hostname: args.host,
    port: args.port,
    fetch(req, server) {
      const session_id = randomUUIDv7()
      return server.upgrade(req, { data: { session_id } }) ?
        new Response("🎉")
        :
        new Response("WebSocket upgrade error", { status: 400 })
    },
    websocket: {
      data: {} as TestData,
      perMessageDeflate: true,
      async open(ws) { console.log(`session ${ws.data.session_id} opened`) },
      async message(ws, message) {
        const { madul, content } = JSON.parse(message as string)
        await rz.handle!({
          madul,
          message: content,
          on: {
            response: (m: { message: { type: string, content: unknown } }) => {
              switch (m.message.type) {
                case 'TEXT': ws.sendText(JSON.stringify(m)); return
                case 'BINARY': ws.sendBinary(m as unknown as BufferSource); return
              }
            }
          },
          session_id: ws.data.session_id,
        })
      },
      close(ws) { console.log('connection closed', ws.data.madul) },
    },
  })
}

main()
