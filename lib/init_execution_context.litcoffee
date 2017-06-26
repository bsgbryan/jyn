    Madul = require 'madul'

    class InitExecutionContext extends Madul

      _action_exists: (input, done, fail) =>
        if @[input.MODULE]?[input.ACTION]?
          input.EXECUTE = @[input.MODULE][input.ACTION]

          done()
        else
          fail 'action-not-found', input.ACTION

      before: (input, done, fail) ->
        if @[input.MODULE]?
          @_action_exists input, done, fail
        else
          @_do_hydrate @, [ input.MODULE ], =>
            if @[input.MODULE]?
              @_action_exists input, done, fail
            else
              fail 'module-not-found', input.MODULE

    module.exports = InitExecutionContext
