type Params = {
  message: string
  server: Bun.ServerWebSocket
}

export default ({
  message,
  server,
}: Params) => {
  server.sendText(`I hear you: ${message}`)
}
