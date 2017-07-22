    Madul = require 'madul'

    class IsArray extends Madul

      EXECUTE: (name, value, done, fail) ->
        return fail("#{name} must be an array") unless Array.isArray value

        done()

    module.exports = IsArray
