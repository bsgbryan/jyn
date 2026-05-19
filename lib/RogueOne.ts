import type { Madul } from "@bsgbryan/madul/lib/types"
import type {
  $launchParams,
  HandleParams,
  Senders,
} from "+types"

import cluster from "cluster"

import bootstrap from "@bsgbryan/madul"

import ROOT from "./root"

const responders: Map<string, Senders> = new Map()

export const $launch = async ({
  port,
  instances,
}: $launchParams) => {
  if (cluster.isPrimary) {
    for (let c = 0; c < instances; c++) {
      const w = new Worker(new URL("RogueOne.ts", import.meta.url), { ref: true })
      w.onmessage = (event: MessageEvent) => {
        const r = responders.get(event.data.session_id)!

        switch (event.data.type) {
          case 'BINARY': r.binary(event.data.content); return
          case 'ERROR':  r.error(event.data.content); return
          case 'JSON':   r.json(JSON.stringify(event.data.content)); return
          case 'TEXT':   r.text(event.data.content); return

          default:  r.error(`${event.data.type} is not a supported content type`); return
        }
      }
    }

    console.log(instances, `worker${instances > 1 ? 's' : ''} listening on port`, port)
  }
}

const handlers: Map<string, Madul> = new Map()

let current = 0
const next = () => ++current < workers.length ? current : 0

export const handle = ({
  madul,
  message,
  send,
  session_id,
}: HandleParams) => {
  if (!responders.has(session_id)) responders.set(session_id, send)
  workers[next()]?.postMessage({ madul, message, session_id })
}

const workers: Worker[] = []

process.on("worker", (w: Worker) => workers.push(w))

onmessage = async ({ data: { madul, ...rest } }) => {
  if (!handlers.has(madul)) {
    try {
      const root = madul.startsWith('jyn') ? ROOT : undefined

      handlers.set(madul, await bootstrap(madul, undefined, root))
    }
    catch (e) {
      console.error('Could not load', madul, e)
      return
    }
  }

  handlers.get(madul)!.default!({...rest})
}
