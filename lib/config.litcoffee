    Madul = require 'madul'

    class Config extends Madul
      deps: [ 'fs', 'arguments' ]

      $load_config: (done, fail) ->
        @fs.stat @arguments.config, (err) =>
          if err?
            @warn 'file-not-found', @arguments.config
            fail()
          else
            @_populate_config_from require @arguments.config
            @_populate_config_from @arguments

            done @

      _populate_config_from: (obj) =>
        for key, val of obj
          if key.length > 2 && typeof val != 'undefined'
            if typeof val == 'object' && val != null && val.length? == false
              @dive_deeper key, val, @
            else
              @[key] = val

      _dive_deeper: (prop, obj, context) =>
        for key, val of obj
          context[prop] = { } unless context[prop]?

          if typeof val == 'object' && val != null && val.length? == false
            @dive_deeper key, val, context[prop]
          else
            context[prop][key] = val

    module.exports = Config
