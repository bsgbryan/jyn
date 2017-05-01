    Module = require './module'
    q      = require 'q'

    class DB extends Module
      deps: [ 'config', 'sql-bricks-mysql', 'mysql' ]
      pub:  [ 'prepare', 'execute' ]

      pool:        undefined
      statement:   undefined
      transformer: undefined

      initialize: =>
        deferred = q.defer()

        super().then =>
          @pool = @mysql.createPool
            host:     @config.DB_HOST
            user:     @config.DB_USER
            password: @config.DB_PASSWORD
            database: @config.DB_DATABASE

          deferred.resolve @

        deferred.promise

      prepare: (cb) =>
        @transformer = undefined
        @statement   = undefined

        q = (callback) => @statement   = callback @sql_bricks_mysql
        t = (callback) => @transformer = callback

        cb q, t

        @done()

      execute: (statement, transformer, callback) =>
        @pool.getConnection (e, connection) =>
          if e
            @fail e
          else
            stmt = statement.toParams placeholder: '?'

            connection.query stmt.text, stmt.values, (err, rows, fields) =>
              connection.release()

              if err?
                callback.reject err.code
              else
                callback.resolve if transformer? == false then rows else transformer rows
                @done statement: stmt, row_count: rows.length

    module.exports = DB
