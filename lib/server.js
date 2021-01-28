const {
  log,
  warn,
  bootstrap,
} = require('./config')(sdk)

const madul = {
  deps: ['ws'],
  boot: ({ ws, port, interval }) => {
    const wss = new ws.Server({ port })

    setInterval(() => {
      wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          log('Terminating client connection', ws)
          ws.terminate()
        } else {
          ws.isAlive = false
          ws.ping('', false, true)
        }
      })
    }, interval * 1000)

    wss.on('error', warn)

    wss.on('connection', (ws, req) => {
      let raw_ip, ip_v4, ip_v6

      try {
        raw_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        ip_v4  = raw_ip.split(':').pop()
        ip_v6  = raw_ip

        if (ip_v4.split('.').length !== 4)
          ip_v4 = null

        if (ip_v6.split(':').length < 3)
          ip_v6 = null
      } catch (e) {
        ip_v4 = null
        ip_v6 = null
      }

      ws.isAlive = true
      ws.on('pong', () => ws.isAlive = true)

      ws.on('message', async message => {
        let input

        try { input = JSON.parse(message) }
        catch (e) { return ws.send('{"error": "Could not parse request"}') }

        const [madul, method] = input.action.split('.')
        let args = { }

        Object.
          keys(input).
          filter(i => i !== 'action').
          forEach(i => args[i] = input[i])

        try {
          const ready  = await bootstrap(`/${madul}`)

          if (typeof ready[method] === 'function') {
            const output = await ready[method]({ ...args, meta: { madul, method, raw_ip, ip_v4, ip_v6 } })

            let result

            switch (typeof output) {
              case 'function':
                return ws.send('{"error": "functions are not allowed as results"}')
              case 'object':
                result = JSON.stringify(output)
                break
              case 'string':
                result = `"${output}"`
                break
              default:
                result = output === undefined ? null : output
            }

            ws.send(`{"result": ${result}}`)
          }
          else
            ws.send(`{"error": "${input.action} is not a valid action"}`)
        }
        catch (e) {
          e.code === 'ENOENT' ?
            ws.send(`{"error": "${madul} does not exist"}`)
            :
            ws.send(`{"error": "${e.message}"}`)
        }
      })

      ws.on('error', warn)
    })
  }
}
