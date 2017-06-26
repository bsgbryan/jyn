    Madul = require 'madul'

    class Server extends Madul

      deps: [ 'ws' ]

      $boot: (done) ->
        wss = new @ws.Server port: 1138

        wss.on 'connection', (ws) =>
          ws.on 'message', (mess) =>
            @handle JSON.parse mess
              .then (output) => @_notify ws, 'COMPLETE', output
              .catch   (err) => @_notify ws, 'ERROR',    err.message
              .progress (up) => @_notify ws, 'PROGRESS', up

      _notify: (socket, status, data) =>
        socket.send JSON.stringify status: status, data: data

      handle:
        validate: KEY: 'hasnt_expired'
        before:   [ 'init_execution_context' ]
        behavior: (input) ->
          args = { }

          for own key, val of input
            if key != 'MODULE' && key != 'ACTION' && key != 'EXECUTE'
              args[key] = val

          input.EXECUTE args

    module.exports = Server
