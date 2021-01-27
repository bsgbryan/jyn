const { log } = require('./config')(sdk)

const listening = w => `worker${w > 1 ? 's' : ''} listening on port`

const madul = {
  deps: ['cluster', '/server'],
  $launch: async ({ cluster, server, port, instances, interval }) => {
    if (cluster.isMaster) {
      for (let c = 0; c < instances; c++)
        cluster.fork()

      log(instances, listening(instances), port)
    } else
      await server.boot({ port, interval })
  }
}
