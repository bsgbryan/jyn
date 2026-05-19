import type { BufferSource } from "bun"
import { randomUUIDv7 } from "bun"

import madul from "@bsgbryan/madul"

import params from "./params"
import ROOT from "./root"

type Session = { id: string }

type Message = {
  type: 'TEXT' | 'BINARY'
  content: unknown
}

const main = async () => {
  const args = await params()
  const rz = await madul('+RogueOne', args, ROOT)

  Bun.serve({
    hostname: args.host,
    port: args.port,
    fetch(req, server) {
      return server.upgrade(req, { data: { id: randomUUIDv7() } }) ?
        new Response("🎉")
        :
        new Response("WebSocket upgrade error", { status: 400 })
    },
    websocket: {
      data: {} as Session,
      perMessageDeflate: true,

      close(ws) { console.log(`session ${ws.data.id} closed`) },
      open(ws)  { console.log(`session ${ws.data.id} opened`) },

      async message(ws, message) {
        const { madul, content } = JSON.parse(message as string)
        await rz.handle!({
          madul,
          message: content,
          on: {
            response: (m: Message) => {
              switch (m.type) {
                case 'TEXT': ws.sendText(JSON.stringify(m)); return
                case 'BINARY': ws.sendBinary(m as unknown as BufferSource); return

                default: ws.sendText(JSON.stringify({
                  type: 'ERROR',
                  content: 'Unsupported message content type',
                })); return
              }
            }
          },
          session_id: ws.data.id,
        })
      },
    },
  })
}

main()
