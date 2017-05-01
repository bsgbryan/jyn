    Module = require './module'

    class Validator extends Module
      pub: [ 'validate' ]

      constructor: -> super arguments.callee.caller.name

    module.exports = Validator
