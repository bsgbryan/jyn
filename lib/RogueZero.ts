import bootstrap from "@bsgbryan/madul"
import type { Madul } from "@bsgbryan/madul/lib/types"
import cluster from "cluster"

const listening = (w: number) => `worker${w > 1 ? 's' : ''} listening on port`

type $launchArguments = {
  port: number
  instances: number
}

export const $launch = async ({
  port,
  instances,
}: $launchArguments) => {
  if (cluster.isPrimary) {
    for (let c = 0; c < instances; c++) cluster.fork()
    console.log(instances, listening(instances), port)
  }
}

type LoadParam = { madul: string }

const handlers: Map<string, Madul> = new Map()

export const load = async ({ madul }: LoadParam) => {
  if (!handlers.has(madul))
    try {
      handlers.set(madul, await bootstrap(`/${madul}`))
      console.log('loaded', madul)
    }
    catch (e) { console.error('Could not load', madul) }
}

type HandleParams = LoadParam & {
  message: string
}

export const handle = ({ madul, message }: HandleParams) => {
  if (handlers.has(madul)) handlers.get(madul)!.default!({ message })
  else console.error("No handler for", madul)
}
