    Madul = require 'madul'

    class HasntExpired extends Madul

      deps: [ 'microtime' ]

      sessions: { }

      EXECUTE: (name, value, done, fail) ->
        now = @microtime.now()

        @sessions[value] = now unless @sessions[value]?

        if now - @sessions[value] > 12000000
          fail "session #{value} has expired"
        else
          @sessions[value] = now

          done()

    module.exports = HasntExpired
