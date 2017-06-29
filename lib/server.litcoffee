    Madul = require 'madul'

    class Server extends Madul

      deps: [ 'ws', 'khaaanfig -> conf = load_config:args', 'jyn#arguments -> args' ]

      load_config: (done) ->
        @conf.load_file require.resolve './khaaanfig'
        @conf.load_args @args

        done()

      $boot: (done) ->
        wss = new @ws.Server port: @conf.ws.port

        wss.on 'connection', (ws) =>
          ws.on 'message', (mess) =>
            @handle JSON.parse mess
              .then (output) => @_notify ws, 'COMPLETE', output
              .catch   (err) => @_notify ws, 'ERROR',    err.message
              .progress (up) => @_notify ws, 'PROGRESS', up

        done()

      _notify: (socket, status, data) =>
        socket.send JSON.stringify { status, data }

      handle:
        validate: KEY: 'jyn#hasnt_expired'
        before:   [ 'jyn#init_execution_context' ]
        behavior: (input) ->
          args = { }

          for own key, val of input
            if key != 'MODULE' && key != 'ACTION' && key != 'EXECUTE'
              args[key] = val

          input.EXECUTE args
            .then     (output) => input.done   output
            .catch    (err)    => input.fail   err
            .progress (delta)  => input.update delta

    module.exports = Server
