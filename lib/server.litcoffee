    Madul = require 'madul'

    class Server extends Madul

      deps: [ 'ws' ]

      boot: (args, done) ->
        wss = new @ws.Server port: args.ws.port

        wss.on 'connection', (ws) =>
          ws.on 'message', (mess) =>
            try
              input = JSON.parse mess
            catch e
              return @_notify ws, 'ERROR', "Could not parse as JSON: #{mess}"

            @handle input
              .then (output) => @_notify ws, 'COMPLETE', output
              .catch   (err) => @_notify ws, 'ERROR',    err.message? || err
              .progress (up) => @_notify ws, 'PROGRESS', up

        done()

      _notify: (socket, status, data) =>
        if status == 'ERROR'
          out = { status, message: data }
        else
          out = { status, data }

        socket.send JSON.stringify out

      handle:
        validate:
          KEY:    [ '.is_present', '.hasnt_expired' ]
          MODULE: '.is_present'
          ACTION: '.is_present'
        before:   '.init_execution_context'
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
