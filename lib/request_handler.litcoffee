    Module = require './module'
    q      = require 'q'

    core_deps = [ 'q', 'db', 'sql-bricks-mysql', 'config' ]

    class RequestHandler extends Module
      deps: core_deps.slice 0
      pub:  [ ]

      constructor: -> super arguments.callee.caller.name

      initialize: =>
        deferred = q.defer()
        @deps    = core_deps.slice 0
        @pub     = [ ]

        finish_up = =>
          @wrap_methods()

          @pub.forEach (verb) =>
            mod = @[verb]

            @["__#{verb}"] = mod

            @[verb] = (input) =>
              def = q.defer()

              decs = @wrap[verb].map (v) =>
                w   = v.split ':'
                dec = w[0].replace /-/g, '_'

                if w.length > 1
                  property = w[1].split '='

                  @[dec][property[0]] = property[1]

                @[dec]

              before = decs.map (d) => d.before if typeof d.before == 'function'
              after  = decs.map (d) => d.after  if typeof d.after  == 'function'

              input = { } unless input?

              @q
                .all before.map (b) => b input if b?
                .then => @["__#{verb}"] input
                .then => @q.all after.map (a) => a input, @db.statement, @sql_bricks_mysql if a?
                .then =>
                  trans = if @db.transformer? then @db.transformer else undefined
                  @db.execute @db.statement, trans, def
                .fail (reason) => def.reject reason

              def.promise

          deferred.resolve @

        @hydrate_dependencies()
          .then =>
            pre_add = @deps.length

            @config.VALID_VERBS.forEach (verb) =>
              if @[verb]?
                @pub.push verb unless @pub.indexOf(verb) > -1

                for wrapper in @wrap[verb]
                  w = wrapper.split ':'

                  @deps.push w[0] unless @deps.indexOf(w[0]) > -1

            if pre_add < @deps.length
              @hydrate_dependencies().then => finish_up()
            else
              finish_up()

        deferred.promise

    module.exports = RequestHandler
