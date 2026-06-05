import type {
  BufferSource,
  TLSOptions,
} from "bun"
import type {
  Result,
  Session,
} from "./types"

import { randomUUIDv7 } from "bun"

import madul from "@bsgbryan/madul"

import params from "./params"
import ROOT from "./root"

const file_types = {
  css: 'css',
  html: 'html',
  js: 'javascript',

  plain: 'plain',
  unknown: 'unknown',
}

const sad       = new Response("😢", { status: 400 })
const not_found = new Response("🔎", { status: 404 })

const ok = (result: Result) => {
  const mime = file_types[(typeof result === 'object' ? result.format : "plain") as keyof object]
  return new Response(
    typeof result === 'string' ? result : result.content,
    { headers: { "Content-Type": `text/${mime}` } }
  )
}

const resolve = (segments: string[]) =>
  segments[1] === 'jyn' ?
    `${__dirname}/../${segments.slice(2).join('/')}`
    :
    `${process.cwd()}${segments.join(('/'))}`

const get = async (path: string, params: URLSearchParams, headers: Headers) => {
  const segments = path.split('/')
  const tokens = segments[segments.length - 1]?.split('.')
  if (tokens && tokens?.length > 1) {
    const content = Bun.file(resolve(segments))
    if (await content.exists()) {
      const ext = tokens[tokens.length - 1] ?? "unknown"
      return new Response(
        await content.text(),
        { headers: { "Content-Type": `text/${file_types[ext as keyof object]}` } }
      )
    }
    else new Response("Not Found", { status: 404 })
  }
  else if (segments.length > 1) {
    const location = resolve(segments)
    if (await Bun.file(`${location}.ts`).exists()) {
      const mad = await import(location)
      return mad.get ? ok(await mad.get(params, headers)) : not_found
    }
    return not_found
  }
  return sad
}

const send = (
  server: Bun.Server<Session>,
  ws: Bun.ServerWebSocket<Session>,
) => ({
  binary: (content: BufferSource) => ws.sendBinary(content),
  error:  (content: string      ) => ws.sendText(JSON.stringify({ format: 'ERROR', content })),
  json:   (content: string      ) => ws.sendText(JSON.stringify({ format: 'JSON',  content })),
  text:   (content: string      ) => ws.sendText(JSON.stringify({ format: 'TEXT',  content })),

  subscribe: (channel: string                 ) => ws.subscribe(channel),
  publish:   (channel: string, content: string) => server.publish(channel, content),
})

const main = async () => {
  const args = await params()
  const casian = await madul('+RogueOne', args, ROOT)

  const tls: TLSOptions = {}

  if (args.tlsCa)   tls.ca   = Bun.file(args.tlsCa)
  if (args.tlsCert) tls.cert = Bun.file(args.tlsCert)
  if (args.tlsKey)  tls.key  = Bun.file(args.tlsKey)

  if (args.tlsKeyPassphrase) tls.passphrase = args.tlsKeyPassphrase
  
  const server = Bun.serve({
    tls,
    hostname: args.host,
    port: args.port,
    async fetch(req, server) {
      if (req.headers.get("connection") === "Upgrade" && req.headers.get("upgrade") === "websocket")
        return server.upgrade(req, { data: { id: randomUUIDv7() } }) ?
          new Response("🎉")
          :
          new Response("WebSocket upgrade error", { status: 400 })
      else if (req.method === 'GET') {
        const url = new URL(req.url)
        return await get(url.pathname, url.searchParams, req.headers)
      }
      else return new Response("Unsupported request", { status: 400 })
    },
    websocket: {
      data: {} as Session,
      perMessageDeflate: true,

      close(ws) { console.log(`session ${ws.data.id} closed`) },
      open(ws)  { console.log(`session ${ws.data.id} opened`) },

      async message(ws, message) {
        const { madul, content } = JSON.parse(message as string)
        await casian.handle!({
          madul,
          message: content,
          send: send(server, ws),
          session_id: ws.data.id,
        })
      },
    },
  })
}

main()
