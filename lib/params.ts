import { cpus } from "os"

import   yargs     from "yargs/yargs"
import { hideBin } from "yargs/helpers"

const env = {
  host: process.env.JYN_HOST ?? "localhost",

  port:      parseInt(process.env.JYN_PORT ?? "1138"),
  prune:     parseInt(process.env.JYN_PRUNE ?? "10"),
  instances: parseInt(process.env.JYN_INSTANCES ?? String(cpus().length)),
}

export default async () =>
  await yargs(hideBin(process.argv)).
    option('host', {
      alias: 'h',
      type: 'string',
      default: env.host,
      description: 'Host to run on'
    }).
    option('port', {
      alias: 'p',
      type: 'number',
      default: env.port,
      description: 'Port to run on'
    }).
    option('prune', {
      alias: 'd',
      type: 'number',
      default: env.prune,
      description: 'Connection pruning interval (in seconds)'
    }).
    option('instances', {
      alias: 'i',
      type: 'number',
      default: env.instances,
      description: 'Number of clustered instances to run'
    }).
    argv