    Validator = require '../validator'

    class IsPositiveNumber extends Validator

      validate: (input, name, alt_value) =>
        parsed = parseInt input[name]

        if (input? && parsed > 0) || (alt_value? && parsed == alt_value)
          input[name] = parsed
          @done()
        else
          @fail name

    module.exports = IsPositiveNumber
