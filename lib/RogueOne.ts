import { randomUUIDv7, sha } from "bun"
import cluster from "cluster"

import type { Madul } from "@bsgbryan/madul/lib/types"
import bootstrap from "@bsgbryan/madul"

const listening = (w: number) => `worker${w > 1 ? 's' : ''} listening on port`

type $launchArguments = {
  self: object
  port: number
  instances: number
}

const responders: Map<string, CallableFunction> = new Map()

export const $launch = async ({
  port,
  instances,
}: $launchArguments) => {
  if (cluster.isPrimary) {
    for (let c = 0; c < instances; c++) {
      const w = new Worker(new URL("RogueOne.ts", import.meta.url), { ref: true })
      w.onerror = function (this: AbstractWorker, ev: ErrorEvent) { console.error(ev) }
      w.onmessage = (event: MessageEvent) =>
          responders.get(event.data.session_id)!({ message: event.data })
    }
    console.log(instances, listening(instances), port)
  }
}

type LoadParam = { madul: string }

const handlers: Map<string, Madul> = new Map()

export const load = async ({ madul }: LoadParam) => {
  workers[0]?.postMessage({ action: 'load', madul})
}

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

  workers[0]?.postMessage({
    action: 'handle',
    madul,
    message,
    session_id,
  })
}

process.on("worker", (w: Worker) => workers.push(w))

const workers: Worker[] = []

onmessage = async ({ data: { action, madul, ...rest } }) => {
  switch (action) {
    case 'handle': {
      if (!handlers.has(madul)) {
        try {
          const root = madul.startsWith('jyn') ?
            `${__dirname}/..`
            :
            undefined

          handlers.set(madul, await bootstrap(madul, undefined, root))
        }
        catch (e) {
          console.error('Could not load', madul, e)
          return
        }
      }

      handlers.get(madul)!.default!({...rest})
      return
    }
  }
}
