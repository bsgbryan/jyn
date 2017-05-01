    Decorator = require '../decorator'

    class NonEmpty extends Decorator

      constructor: (@field) -> super()

      after: (_, query, vocab) =>
        if @field?
          notEq     = vocab.notEq
          isNotNull = vocab.isNotNull

          @done query.where(notEq(@field, '')).and(isNotNull(@field))
        else
          @fail field: null

    module.exports = NonEmpty
