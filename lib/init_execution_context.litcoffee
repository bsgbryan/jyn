    Madul = require 'madul'

    class InitExecutionContext extends Madul

      _action_exists: (input, ref, done, fail) =>
        if @[ref]?[input.ACTION]?
          input.EXECUTE = @[ref][input.ACTION]

          done()
        else
          fail "Action #{input.ACTION} not available"

      before: (input, done, fail) ->
        spec = Madul.PARSE_SPEC ".#{input.MODULE}"

        if @[spec.ref]?
          @_action_exists input, spec.ref, done, fail
        else
          Madul.DUMMY [ ".#{input.MODULE}" ], (dum) =>
            @[spec.ref] = dum[spec.ref]
            @_action_exists input, spec.ref, done, fail

    module.exports = InitExecutionContext
