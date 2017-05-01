    Decorator = require '../decorator'

    class Sortable extends Decorator

      constructor: (@field) -> super()

      before: (input) =>
        direction = 'ASC'

        upperOrder = if input.order? then input.order.toUpperCase() else 'ASC'

        if upperOrder == 'DESC'
          direction = upperOrder
        else if upperOrder != 'ASC'
          return @fail order: 'INVALID'

        input.order = direction

        @done input

      after: (input, query) =>
        if @field?
          @done query.orderBy "#{@field} #{input.order}"
        else
          @fail field: 'INVALID'

    module.exports = Sortable
