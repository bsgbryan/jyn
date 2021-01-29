const {
  log,
  warn,
  bootstrap,
} = require('./config')(sdk)

let wss

const format = output => {
  switch (typeof output) {
    case 'object':
      return JSON.stringify(output)
    case 'string':
      return `"${output}"`
    default:
      return output === undefined ? null : output
  }
}

const extractIPData = req => {
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

  return { raw_ip, ip_v4, ip_v6 }
}

const extractArgs = input => {
  let args = { }

  Object.
    keys(input).
    filter(i => i !== 'action').
    forEach(i => args[i] = input[i])

  return args
}

const message = (ws, req) => async m => {
  let input, madul, method

  try { input = JSON.parse(m) }
  catch (e) { return ws.send('{"error": "Could not parse request"}') }

  try { [madul, method] = input.action.split('.') }
  catch (e) { return ws.send('{"error": "Could not parse action"}') }

  try {
    const ready = await bootstrap(`/${madul}`)

    if (typeof ready[method] === 'function') {
      const meta   = { madul, method, ...extractIPData(req) },
            output = await ready[method]({ ...extractArgs(input), meta })

      typeof output === 'function' ?
        ws.send('{"error": "functions are not allowed as results"}')
        :
        ws.send(`{"result": ${format(output)}}`)
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
}

const pong = ws => () => ws.isAlive = true

const connection = (ws, req) => {
  pong(ws)()

  ws.on('pong',    pong(ws))
  ws.on('message', message(ws, req))
  ws.on('error',   warn)
}

const madul = {
  deps: ['ws'],
  boot: ({ ws, port }) => {
    wss = new ws.Server({ port })

    wss.on('error',      warn)
    wss.on('connection', connection)
  },
  prune: () =>
    wss.clients.forEach(ws => {
      if (ws.isAlive === false) {
        log('Terminating client connection', ws)
        ws.terminate()
      } else {
        ws.isAlive = false
        ws.ping('', false, true)
      }
    })
}
