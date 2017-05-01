    Module = require './module'

    pub_core = [ ]

    class Decorator extends Module
      pub: pub_core.slice 0

      constructor: ->
        @pub = pub_core.slice 0

        @pub.push 'before' if @before?
        @pub.push 'after'  if @after?

        super arguments.callee.caller.name

    module.exports = Decorator
