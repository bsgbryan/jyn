let counter = Number(localStorage.getItem('counter') ?? 0)
let ping
let active = Boolean(localStorage.getItem('active'))

const fn = (ws) => () => {
  if (active) {
    console.log(`SENT: ping: ${counter}`)
    ws.send(`ping: ${counter++}`)
  }
}

const open = (ws) => () => {
  console.log("opened connection to", document.getElementById("url").value)
  active = true

  if (!ping) {
    console.log('initializing ping interval')
    ping = setInterval(fn(ws), 1000)
  }
}

const clear = () => {
  console.log("server closed connection, clearing ping interval")
  clearInterval(ping)
  ping = undefined
}

const init = (event) => {
  event?.preventDefault()

  if (ping) clear()

  ws = new WebSocket(document.getElementById("url").value)
  ws.addEventListener("open", open(ws))
  ws.addEventListener("close", clear)
}

const hide = () => {
  console.log('saving state on pagehide')
  localStorage.setItem('active', active ? "true": "")
  localStorage.setItem('counter', counter)
  localStorage.setItem('url', document.getElementById("url").value)

  console.log('clearing ping interval')
  window.clearInterval(ping)
  ping = undefined

  if (ws) {
    console.log("closing connection")
    ws.close()
    ws = undefined
    active = false
  }
}

document.getElementById("url").value = localStorage.getItem('url')
document.getElementById("connect").addEventListener("click", init)

window.addEventListener("pagehide", hide)

let ws = new WebSocket(document.getElementById("url").value)

if (active) init()
