    Madul = require 'madul'

    class IsInteger extends Madul

      EXECUTE: (name, value, done, fail) ->
        return fail("#{name} must be an integer") unless value == parseInt value, 10

        done()

    module.exports = IsInteger
