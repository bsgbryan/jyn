    Madul = require 'madul'

    class FileExists extends Madul

      deps: [ 'fs' ]

      EXECUTE: (name, value, done, fail) ->
        @fs.stat value, (_, stats) =>
          return fail("#{name} file not found") unless stats.isFile()

          done()

    module.exports = FileExists
