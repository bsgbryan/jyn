    Madul = require 'madul'

    class IsPositiveInteger extends Madul

      EXECUTE: (name, value, done, fail) ->
        return fail("#{name} must be a positive integer") unless value > 0

        done()

    module.exports = IsPositiveInteger
