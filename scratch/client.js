let counter = Number(localStorage.getItem('counter') ?? 0)
let ws
let ping
let active = Boolean(localStorage.getItem('active'))

const fn = () => {
  if (active) {
    console.log(`SENT: ping: ${counter}`)
    ws.send(`ping: ${counter++}`)
  }
}

const open = () => {
  console.log("opened connection to", document.getElementById("url").value)
  active = true

  if (!ping) {
    console.log('initializing ping interval')
    ping = setInterval(fn, 1000)
  }
}

const close = () => {
  console.log("server closed connection, clearing ping interval")
  clearInterval(ping)
  ping = undefined
  ws = undefined
}

const reset = () => {
  console.log('closing existing connection')
  ws.close()
  ws = undefined

  if (ping) {
    console.log('clearing existing ping interval')
    window.clearInterval(ping)
    ping = undefined
  }
}

const init = () => {
  if (ws) reset()

  const url = document.getElementById("url").value
  ws = new WebSocket(url)

  ws.addEventListener("open", open)
  ws.addEventListener("close", close)
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

if (active) init()