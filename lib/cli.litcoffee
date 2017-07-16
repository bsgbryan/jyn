    `#! /usr/bin/env node
    `

    if process.env.JYN_ENABLE_LOGGING
      require 'magnus'

    Server = require './server'
    args   = require './arguments'

    new Server()
      .initialize()
      .then (server) ->
        server.boot args
          .then ->
            console.log "\nJyn listening on port #{args.ws.port}"
