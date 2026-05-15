import type { TimerHandler } from "bun"
import cluster from "cluster"
import { cpus } from "os"

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
    for (let c = 0; c < instances; c++) {
      console.log('Forking', c)
      cluster.fork()
    }

    console.log(instances, listening(instances), port)
  }
  else console.log('Loading', cluster.worker!.id)
}
