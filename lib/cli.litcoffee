    `#! /usr/bin/env node
    `

    Server = require './server'
    args   = require './arguments'

    new Server()
      .initialize()
      .then (server) ->
        server.boot args
          .then ->
            console.log "\nJyn listening on port #{args.ws.port}"
