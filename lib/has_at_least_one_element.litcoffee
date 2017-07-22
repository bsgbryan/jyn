    Madul = require 'madul'

    class HasAtLeastOneElement extends Madul

      EXECUTE: (name, value, done, fail) ->
        return fail("#{name} must have at least one element") unless value.length > 0

        done()

    module.exports = HasAtLeastOneElement
