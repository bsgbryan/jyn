import { randomUUIDv7, sha } from "bun"
import cluster from "cluster"

import type { Madul } from "@bsgbryan/madul/lib/types"
import bootstrap from "@bsgbryan/madul"

import ROOT from "./root"

type $launchParams = {
  self: object
  port: number
  instances: number
}

const responders: Map<string, CallableFunction> = new Map()

export const $launch = async ({
  port,
  instances,
}: $launchParams) => {
  if (cluster.isPrimary) {
    for (let c = 0; c < instances; c++) {
      const w = new Worker(new URL("RogueOne.ts", import.meta.url), { ref: true })
      w.onmessage = (event: MessageEvent) => responders.get(event.data.session_id)!({ ...event.data })
    }

    console.log(instances, `worker${instances > 1 ? 's' : ''} listening on port`, port)
  }
}

type LoadParam = { madul: string }

const handlers: Map<string, Madul> = new Map()

let current = 0
const next = () => ++current < workers.length ? current : 0

type HandleParams = LoadParam & {
  message: string
  on: {
    response: CallableFunction
  }
  session_id: string
}

export const handle = ({
  madul,
  message,
  on: {response},
  session_id,
}: HandleParams) => {
  if (!responders.has(session_id)) responders.set(session_id, response)
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
