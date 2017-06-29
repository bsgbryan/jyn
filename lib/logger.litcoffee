    Madul = require 'madul'

    spaces = -2
    last   = 'no arg'

    indent = (depth) ->
      pad = for i in [0...depth]
        ' '
      pad.join ''

    process_object = (obj, shallow = false) ->
      spaces += 2

      if obj?
        out = for own k, v of obj
          if shallow == false
            if typeof v == 'function'
              "\n#{indent spaces}{ #{k}: #{v.constructor.name} }"
            else if Array.isArray v
              if v.length >= 3 && typeof v[v.length - 1] == 'function'
                v = v.slice()

                v.pop()
                v.pop()
                v.pop()

              if v.length > 5
                "\n#{indent spaces}{#{k}: [ #{v[0].constructor.name} ]..#{v.length}}"
              else
                "\n#{indent spaces}#{k}: #{process_array v}"
            else if typeof v == 'object'
              "\n#{indent spaces}#{k}: #{process_object v}"
            else
              "\n#{indent spaces}#{k}: #{v}"
          else
            "#{k}: #{v.constructor.name}"
      else
        out = [ '{ }' ]

      spaces -= 2

      out.join ', '

    process_array = (arr, shallow = false) ->
      spaces += 2

      if arr.length > 0
        out = for a in arr
          if shallow == false
            if typeof a == 'function'
              a.constructor.name
            else if Array.isArray a
              if a.length > 5
                "\n#{indent spaces}{ #{process_object a[0], true} }..#{a.length}"
              else if a.length > 0
                process_array a
              else
                "\n#{indent spaces}[ ]"
            else if typeof a == 'object'
              process_object a
            else
              "\n#{indent spaces}#{a}"
          else
            "\n#{indent spaces}#{a.constructor.name}"
      else
        out = [ "[ ]" ]

      spaces -= 2

      out.join ', '

    Madul.LISTEN '**', ->
      args = Array.prototype.slice.call arguments
      pre  = ''

      if typeof args[0] == 'object'
        pre  = '\n'
        out  = process_array args
        last = 'multi arg'
      else if typeof args[0] == 'undefined'
        pre  = '\n' if last == 'multi arg'
        out  = ''
        last = 'no arg'
      else
        pre  = '\n' if last == 'multi arg'
        out  = "(#{args[0]})"
        last = 'one arg'

      console.log "#{pre}#{@event}#{out}"
