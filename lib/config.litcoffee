    Module = require './module'
    q      = require 'q'

    class Config extends Module
      deps: [ 'readline', 'fs' ]

      config: { }

      initialize: =>
        deferred = q.defer()

        super().then =>
          reader = @readline.createInterface input: @fs.createReadStream './.env'

          reader.on 'line', (line) =>
            param = line.split ':'

            if /,+/.test param[1]
              @config[param[0]] = param[1].split ','
            else if /^\d+$/.test param[1]
              @config[param[0]] = parseInt param[1]
            else
              @config[param[0]] = param[1]

          reader.on 'error', (err) => @fail err

          reader.on 'close', => deferred.resolve @config

        deferred.promise

    module.exports = Config
