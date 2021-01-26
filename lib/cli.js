#! /usr/bin/env node

const os   = require('os')
const cpus = os.cpus().length

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
    default: isNaN(env.instances) ? cpus : env.instances,
    description: 'Number of clustered instances to run'
  }).
  argv

const main = async () => await bootstrap('/RogueZero', params, { root: `${__dirname}/..` })

main()
