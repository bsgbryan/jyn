    Madul = require 'madul'

    STATUSES =
      COMPLETE: 'COMPLETE'
      ERROR:    'ERROR'
      PROGRESS: 'PROGRESS'

    EXCLUDE = [
      'MODULE'
      'ACTION'
      'EXECUTE'
    ]

    class Server extends Madul

      deps: [ 'ws' ]

      boot: (args, done) ->
        wss = new @ws.Server port: args.ws.port

        wss.on 'connection', (ws) =>
          ws.on 'message', (mess) =>
            try
              input = JSON.parse mess
            catch e
              return @_notify ws, STATUSES.ERROR, "Could not parse as JSON: #{mess}"

            @handle input
              .then (output) => @_notify ws, STATUSES.COMPLETE, output
              .catch   (err) => @_notify ws, STATUSES.ERROR,    err.args? || err
              .progress (up) => @_notify ws, STATUSES.PROGRESS, up

        done()

      _notify: (socket, status, data) =>
        if status == STATUSES.ERROR
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
        behavior: (input, done, fail, update) ->
          args = { }

          for own key, val of input
            args[key] = val unless EXCLUDE.includes key

          input.EXECUTE args
            .then     done
            .catch    fail
            .progress update

    module.exports = Server
