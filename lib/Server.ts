import type { BufferSource } from "bun"
import { randomUUIDv7 } from "bun"

import madul from "@bsgbryan/madul"

import params from "./params"
import ROOT from "./root"

type Session = { id: string }

type Message = {
  type: 'BINARY' | 'ERROR' | 'JSON' | 'TEXT'
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
          send: {
            binary: (content: BufferSource) => ws.sendBinary(content),
            error:  (content: string      ) => ws.sendText(JSON.stringify({ format: 'ERROR', content })),
            json:   (content: string      ) => ws.sendText(JSON.stringify({ format: 'JSON',  content })),
            text:   (content: string      ) => ws.sendText(JSON.stringify({ format: 'TEXT',  content })),
          },
          session_id: ws.data.id,
        })
      },
    },
  })
}

main()
