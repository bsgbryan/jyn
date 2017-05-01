    Decorator = require '../decorator'

    class Pageable extends Decorator
      deps: [ 'q', 'is_positive_number' ]

      before: (input) =>
        input.page = 1  unless input.page?
        input.size = 10 unless input.size?

        @q.all([
          @is_positive_number.validate(input, 'size', -1),
          @is_positive_number.validate(input, 'page')
        ])
        .then         => @done input
        .fail (field) => @fail "#{field}": 'INVALID'

      after: (input, query) =>
        if input.size? && input.page? && input.size != -1
          @done query.limit(input.size).offset((input.page - 1) * input.size)
        else
          @done query

    module.exports = Pageable
