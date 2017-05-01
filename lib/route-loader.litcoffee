    Module = require './module'

    class RouteLoader extends Module
      deps: [ 'directory-diver', 'path', 'config' ]
      pub:  [ 'load_routes' ]

      routes: { }

      load_routes: =>
        loaded  = 0
        loading = 0

        @directory_diver.dive_for_files @path.join __dirname, @config.ROUTES_ROOT
          .progress (file) =>
            unless file.name.includes '.spec.'
              mod = require @path.join file.path, file.name
              ++loading

              new mod()
                .initialize()
                .then (mod) =>
                  name = file.name.substring(0, file.name.length - 3)
                  @routes[name] = mod

                  @update path: name, handler: mod
                  @done @routes if ++loaded == loading

    module.exports = RouteLoader
