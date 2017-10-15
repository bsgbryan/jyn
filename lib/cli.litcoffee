    `#! /usr/bin/env node
    `

    if process.env.JYN_ENABLE_LOGGING
      require 'magnus'

    cluster = require 'cluster'

    if cluster.isMaster
      cpus = require('os').cpus().length
      
      for cpu in [0...cpus]
        cluster.fork()
          
      console.log "Spun #{cpus} worker processes up"
    else
      Server = require './server'
      args   = require './arguments'

      new Server()
        .initialize()
        .then (server) ->
          server.boot args
            .then ->
              console.log "\nJyn listening on port #{args.ws.port}"
