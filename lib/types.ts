export type $launchParams = {
  self: object
  port: number
  instances: number
}

export type Session = { id: string }

export type Senders = {
  binary: CallableFunction
  error:  CallableFunction
  json:   CallableFunction
  text:   CallableFunction

  publish:   CallableFunction
  subscribe: CallableFunction
}

export type HandleParams = {
  madul: string
  message: string
  send: {
    binary: CallableFunction
    error:  CallableFunction
    json:   CallableFunction
    text:   CallableFunction

    subscribe: CallableFunction
    publish:   CallableFunction
  }
  session_id: string
}

export type Result = string | {
  content?: string,
  format?: keyof object,
}
