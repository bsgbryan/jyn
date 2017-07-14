    Madul = require 'madul'

    class IsPresent extends Madul

      EXECUTE: (name, value, done, fail) ->
        return fail("#{name} is a required argument") unless value?

        done()

    module.exports = IsPresent
