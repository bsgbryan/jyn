import { cpus } from "os"

import   yargs     from "yargs/yargs"
import { hideBin } from "yargs/helpers"

const env = {
  port:      parseInt(process.env.JYN_PORT ?? "1138"),
  prune:     parseInt(process.env.JYN_PRUNE ?? "10"),
  instances: parseInt(process.env.JYN_INSTANCES ?? String(cpus().length)),
}

export default await yargs(hideBin(process.argv)).
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