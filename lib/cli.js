#! /usr/bin/env node

const {
  isMaster,
  isWorker,
} = require('cluster')

const {
  cpus,
  tmpdir,
} = require('os')

const {
  stat,
  rmdir,
} = require('fs').promises

const {
  log,
  warn,
} = require('./config')()

const   yargs     = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const bootstrap = require('@bsgbryan/madul/bootstrap')

const env = {
  port:      parseInt(process.env.JYN_PORT),
  interval:  parseInt(process.env.JYN_INTERVAL),
  instances: parseInt(process.env.JYN_INSTANCES),
}

const params = yargs(hideBin(process.argv)).
  option('port', {
    alias: 'p',
    type: 'number',
    default: isNaN(env.port) ? 1138 : env.port,
    description: 'Port to run server on'
  }).
  option('interval', {
    alias: 't',
    type: 'number',
    default: isNaN(env.interval) ? 10 : env.interval,
    description: 'Dead connection pruning interval'
  }).
  option('instances', {
    alias: 'i',
    type: 'number',
    default: isNaN(env.instances) ? cpus().length : env.instances,
    description: 'Number of clustered instances to run'
  }).
  argv

const main = async () => {
  if (isMaster) {
    let s

    try { s = await stat(`${tmpdir()}/madul`) }
    catch (e) { log('No madul cache to clear') }

    if (s && s.isDirectory()) {
      await rmdir(`${tmpdir()}/madul`, { recursive: true })

      log('Cleared madul cache')
    }
  }

  let rz

  try { rz = await bootstrap('/RogueZero', params, { root: `${__dirname}/..` }) }
  catch (e) { return warn(e.message) }

  if (isWorker) {
    const id = rz.prune({ interval: params.interval })

    process.on('beforeExit', () => clearInterval(id))
  }
}

main()
