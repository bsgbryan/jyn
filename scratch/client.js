let dark_mode = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches

window.matchMedia?.('(prefers-color-scheme: dark)')?.addEventListener('change', (event) => {
  dark_mode = event.matches
  document.documentElement.setAttribute('color-scheme', dark_mode ? 'dark' : 'light')
})

document.documentElement.setAttribute('color-scheme', dark_mode ? 'dark' : 'light')

let active = Boolean(localStorage.getItem('active'))
let counter = Number(localStorage.getItem('counter') ?? 0)
let ping

const fn = (ws) => () => {
  if (active) {
    const content = `count: ${counter++}`
    const json = JSON.stringify({
      madul: 'jyn:echo',
      content,
    })

    ws.send(json)

    const message = document.createElement("li")
    message.classList.add("client")
    message.classList.add("message")
    message.innerHTML = `<p>${content}</p>`

    const messages = document.querySelector(".messages ul")
    messages.appendChild(message)
  }
}

const open = (ws) => () => {
  console.log("opened connection to", document.getElementById("url").value)
  active = true

  if (!ping) {
    console.log('initializing ping interval')
    ping = setInterval(fn(ws), 1000)
  }

  const message = document.createElement("li")
  message.classList.add("server")
  message.classList.add("event")
  message.innerHTML = `<p>connected</p>`

  const messages = document.querySelector(".messages ul")
  messages.appendChild(message)
}

const message = (event) => {
  const json = JSON.parse(event.data)

  const message = document.createElement("li")
  message.classList.add("server")
  message.classList.add("message")
  message.innerHTML = `<p>${json.content}</p>`

  const messages = document.querySelector(".messages ul")
  messages.appendChild(message)
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
  ws.addEventListener("message", message)
  ws.addEventListener("close", clear)
}

const disconnect = (event) => {
  event?.preventDefault()

  console.log("closing connection")
  ws.close()
  ws = undefined
  active = false

  const message = document.createElement("li")
  message.classList.add("server")
  message.classList.add("event")
  message.innerHTML = `<p>disconnected</p>`

  const messages = document.querySelector(".messages ul")
  messages.appendChild(message)
}

const reset_counter = (event) => {
  event.preventDefault()

  counter = 0
}

const clear_messages = (event) => {
  event.preventDefault()

  document.querySelector(".messages ul").innerHTML = ""
}

const hide = () => {
  console.log('saving state on pagehide')
  localStorage.setItem('active', active ? "true": "")
  localStorage.setItem('counter', counter)
  localStorage.setItem('url', document.getElementById("url").value)

  console.log('clearing ping interval')
  window.clearInterval(ping)
  ping = undefined

  if (ws) disconnect()
}

document.getElementById("url").value = localStorage.getItem('url')
document.getElementById("connect").addEventListener("click", init)
document.getElementById("disconnect").addEventListener("click", disconnect)
// document.getElementById("reset-counter").addEventListener("click", reset_counter)

document.getElementById("clear").addEventListener("click", clear_messages)

window.addEventListener("pagehide", hide)

let ws = new WebSocket(document.getElementById("url").value)

if (active) init()
