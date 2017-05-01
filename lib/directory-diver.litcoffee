    Module = require './module'
    q      = require 'q'

    _do_dive = (path, _, recursed = false) ->
      deferred = q.defer()

      _.fs.readdir path, (err, files) ->
        if err?
          _.fail err
          deferred.reject()
        else
          _.to_check += files.length - 1

          files.forEach (f) ->
            _.fs.lstat "#{path}/#{f}", (e, s) ->
              if s.isDirectory()
                _do_dive _.path.join(path, f), _, true
                  .progress ->
                    if _.checked++ == _.to_check
                      _.done()
                      deferred.resolve()
              else if s.isFile()
                _.update name: f, path: path
                deferred.notify()

                if recursed == false && _.checked++ == _.to_check
                  _.done()
                  deferred.resolve()

      deferred.promise

    class DirectoryDiver extends Module
      deps: [ 'fs', 'path' ]
      pub: [ 'dive_for_files' ]

      to_check: 0
      checked: 0

      dive_for_files: (root = __dirname) => _do_dive root, @

    module.exports = DirectoryDiver
