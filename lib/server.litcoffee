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

    heartbeat = -> @isAlive = true

    class Server extends Madul

      deps: [ '~ws', '.db' ]

      boot: (args, done) ->
        wss = new @ws.Server port: args.ws.port

        setInterval ->
          wss.clients.forEach (ws) ->
            return ws.terminate() if ws.isAlive == false

            ws.isAlive = false
            ws.ping '', false, true
        , 10000

        wss.on 'error', (details) =>
          console.log 'WebSocket Server got error', details

        wss.on 'connection', (ws, req) =>
          try
            raw_ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split ':'
            ip_v4  = raw_ip.pop()
            ip_v6  = raw_ip.join ':'

            ip_v4 = null if ip_v4.split('.').length != 4
            ip_v6 = null if ip_v6.split(':').length  < 3
          catch e
            ip_v4  = null
            ip_v6  = null
          
          ws.isAlive = true
          ws.on 'pong', heartbeat
          
          ws.on 'message', (mess) =>
            try
              input = JSON.parse mess
            catch e
              return @_notify ws, STATUSES.ERROR, "Could not parse as JSON: #{mess}"

            args = { }

            for key, val of input
              if key != 'MODULE' and key != 'ACTION'
                args[key] = val

            @db.log_api_call
              v4_address: ip_v4
              v6_address: ip_v6
              module:     input.MODULE || 'NONE'
              action:     input.ACTION || 'NONE'
              args:       args

            input._client_ip_address =
              v4: ip_v4
              v6: ip_v6

            @handle input
              .then (output) => @_notify ws, STATUSES.COMPLETE, output
              .catch   (err) => @_notify ws, STATUSES.ERROR,    err.args? || err
              .progress (up) => @_notify ws, STATUSES.PROGRESS, up

          ws.on 'error', (details) =>
            console.log 'WebSocket got error', details

        done()

      _notify: (socket, status, data) =>
        if status == STATUSES.ERROR
          out = { status, message: data }
        else
          out = { status, data }

        try
          if socket.readyState == @ws.OPEN
            socket.send JSON.stringify(out), (err) =>
              if err?
                console.log 'Get error sending message', err
          else
            consle.log 'SOCKET NOT OPEN'
        catch e
          console.log 'Message send threw an error', e

      handle:
        validate:
          # KEY:    [ '.is_present', '.hasnt_expired' ]
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
            .done()

    module.exports = Server
