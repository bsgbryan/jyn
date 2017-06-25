    Madul = require 'madul'

    class Server extends Madul

      deps: [ 'ws' ]

      $boot: (done) ->
        wss = new @ws.Server port: 1138

        wss.on 'connection', (ws) =>
          ws.on 'message', (mess) =>
            console.log 'THIS', @
            @handle JSON.parse mess
              .then (output) => ws.send status: 'COMPLETE', data: output
              .catch   (err) => ws.send status: 'ERROR',    data: err
              .progress (up) => ws.send status: 'PROGRESS', data: up

      handle:
        validate: KEY: 'hasnt_expired'
        before:   [ 'init_execution_context' ]
        behavior: (input, done, fail, update) ->
          input.EXECUTE input
            .then     done
            .catch    fail
            .progress update

    module.exports = Server
