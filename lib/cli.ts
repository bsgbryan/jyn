import {
  isPrimary,
  isWorker,
} from "cluster"

import { cpus } from "os"

import   yargs     from "yargs/yargs"
import { hideBin } from "yargs/helpers"

import madul from "@bsgbryan/madul"

const env = {
  port:      parseInt(process.env.JYN_PORT ?? "1138"),
  prune:     parseInt(process.env.JYN_PRUNE ?? "10"),
  instances: parseInt(process.env.JYN_INSTANCES ?? String(cpus().length)),
}

const params = await yargs(hideBin(process.argv)).
  option('port', {
    alias: 'p',
    type: 'number',
    default: env.port,
    description: 'Port to run server on'
  }).
  option('prune', {
    alias: 'd',
    type: 'number',
    default: env.prune,
    description: 'Dead connection pruning interval (in seconds)'
  }).
  option('instances', {
    alias: 'i',
    type: 'number',
    default: env.instances,
    description: 'Number of clustered instances to run'
  }).
  argv

const main = async () => {
  const rz = await madul('+RogueZero', params, `${__dirname}/..`)

  if (isPrimary) await import("./Server")
  else if (isWorker) console.log('Worker created!')
}

main()
