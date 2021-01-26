const { log } = require('./config')(sdk)

const listening = w => `worker${w > 1 ? 's' : ''} listening on port`

const madul = {
  deps: ['cluster', '/server'],
  $launch: async function({ port, instances, interval, done }) {
    if (this.cluster.isMaster) {
      for (let c = 0; c < instances - 1; c++)
        this.cluster.fork()

      log(instances, listening(instances), port)
    } else
      await this.server.boot({ port, interval })

    done()
  }
}
