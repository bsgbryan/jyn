    Module = require './module'

    class Bootstrapper extends Module
      deps: [ 'route-loader', 'server', 'config' ]
      pub:  [ 'bootstrap' ]

      bootstrap: =>
        @server.configure()
          .then => @route_loader.load_routes()
          .progress (route)  =>
            handled = [ ]

            @config.VALID_VERBS.forEach (verb) =>
              if route.handler[verb]?
                @server.handle verb, route.path, route.handler[verb]
                handled.push verb

            console.log "LOADED #{route.path}(#{handled.join ', '})"
          .then => @server.start()
          .fail (reason) -> console.error reason

    module.exports = Bootstrapper
