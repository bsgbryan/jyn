import { cpus } from "os"

import   yargs     from "yargs/yargs"
import { hideBin } from "yargs/helpers"

const env = {
  host: process.env.JYN_HOST ?? "localhost",

  port:      parseInt(process.env.JYN_PORT ?? "1138"),
  prune:     parseInt(process.env.JYN_PRUNE ?? "10"),
  instances: parseInt(process.env.JYN_INSTANCES ?? String(cpus().length)),

  tls_ca:   process.env.JYN_TLS_CA   || undefined,
  tls_cert: process.env.JYN_TLS_CERT || undefined,
  tls_key:  process.env.JYN_TLS_KEY  || undefined,

  passphrase: process.env.JYN_TLS_KEY_PASSPHRASE || undefined,
}

export default async () =>
  await yargs(hideBin(process.argv)).
    option('host', {
      alias: 'h',
      type: 'string',
      default: env.host,
      description: 'Host to run on',
    }).
    option('port', {
      alias: 'p',
      type: 'number',
      default: env.port,
      description: 'Port to run on',
    }).
    option('prune', {
      alias: 'd',
      type: 'number',
      default: env.prune,
      description: 'Connection pruning interval (in seconds)',
    }).
    option('instances', {
      alias: 'i',
      type: 'number',
      default: env.instances,
      description: 'Number of clustered instances to run',
    }).
    option('tls-ca', {
      alias: 'a',
      type: 'string',
      default: env.tls_ca,
      description: 'Location of the file containing root CA Certificate',
    }).
    option('tls-cert', {
      alias: 'c',
      type: 'string',
      default: env.tls_cert,
      description: 'Location of the file containing your TLS Certificate',
    }).
    option('tls-key', {
      alias: 'k',
      type: 'string',
      default: env.tls_key,
      description: 'Location of the file containing your private key',
    }).
    option('tls-key-passphrase', {
      alias: 's',
      type: 'string',
      default: env.passphrase,
      description: 'Passphrase for your private key',
    }).
    argv
