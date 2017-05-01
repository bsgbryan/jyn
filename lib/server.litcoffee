    Module = require './module'

    class Server extends Module
      deps: [ 'express', 'body-parser', 'config' ]
      pub:  [ 'configure', 'handle', 'start' ]

      app: undefined

      configure: =>
        @app = @express()
        @app.use @body_parser.json()
        @app.use (req, res, next) ->
          res.header 'Access-Control-Allow-Origin', '*'
          res.header 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'
          next()

        @done @

      handle: (verb, path, handler) =>
        @app[verb] "/#{path}", (req, res) ->
          input = { }

          input[k] = v for k, v of req.body   if req.body?
          input[k] = v for k, v of req.query  if req.query?
          input[k] = v for k, v of req.params if req.params?

          handler input
            .then (output) -> res.json output
            .fail (err)    ->
              res
                .status 417
                .json err

        @done @

      start: =>
        @app.listen @config.SERVER_PORT, =>
          console.log "Listening on port #{@config.SERVER_PORT}"
          @done @

    module.exports = Server
