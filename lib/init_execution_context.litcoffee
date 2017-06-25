    Madul = require 'madul'

    class InitExecutionContext extends Madul

      _action_exists: (mod, action, done, fail) =>
        if @[mod]?[action]?
          done()
        else
          fail 'action-not-found', action

      before: ({MODULE, ACTION, done, fail}) ->
        console.log 'arguments', arguments
        console.log 'MODULE', MODULE

        if @[MODULE]?
          @_action_exists MODULE, ACTION, done, fail
        else
          @_do_hydrate @, [ MODULE ], =>
            if @[MODULE]?
              @_action_exists MODULE, ACTION, done, fail
            else
              fail 'module-not-found', MODULE
