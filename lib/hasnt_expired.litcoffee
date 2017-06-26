    Madul = require 'madul'

    class HasntExpired extends Madul

      deps: [ 'microtime' ]

      sessions: { }

      EXECUTE: (KEY, done, fail) ->
        now = @microtime.now()

        @sessions[KEY] = now unless @sessions[KEY]?

        if now - @sessions[KEY] > 12000000
          fail "session #{key} has expired"
        else
          @sessions[KEY] = now

          done()

    module.exports = HasntExpired
