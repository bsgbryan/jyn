    Madul = require 'madul'

    class IsFloat extends Madul

      EXECUTE: (name, value, done, fail) ->
        return fail("#{name} must be a float") unless value == parseFloat value

        done()

    module.exports = IsFloat
