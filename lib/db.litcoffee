    Madul = require 'madul'

    DIRECT = undefined
    SQL    = undefined

    class DB extends Madul
      deps: [ '~sql-bricks-postgres', '~pg-promise', '~khaaanfig -> config = load_config', 'path' ]

      listeners: { }

      load_config: (done, fail) ->
        location = @path.join process.cwd(), 'jyn.conf.json'
        
        @config.load_file location
          .then done
          .catch =>
            @warn 'file-not-found', location, fail

      $post_initialize: (done, fail) ->
        SQL       = @sql_bricks_postgres
        @postgres = @pg_promise(promiseLib: require 'q') "pg://#{@config.db.user}:#{@config.db.password}@#{@config.db.host}:#{@config.db.port}/#{@config.db.name}"

        @postgres.connect direct: true
          .catch (err) => @warn 'connect.failure', err
          .then  (sco) =>
            if sco != false
              DIRECT = sco

              DIRECT.client.on 'notification', (event) =>
                if Array.isArray @listeners[event.channel]
                  for listener in @listeners[event.channel]
                    data = JSON.parse event.payload

                    if data.error?
                      console.log 'bad data!', data.error
                    else
                      listener data

              done()
            else
              fail()

      _listen: (event, handler) =>
        unless Array.isArray @listeners[event]
          @listeners[event] = [ ]

          DIRECT.none 'LISTEN $1~', event

        @listeners[event].push handler

      log_api_call: (args, done, fail) ->
        query = @sql_bricks_postgres
          .insert 'api_call_log', args
          .toParams()

        @postgres.none query.text, query.values
          .then  done
          .catch fail

    module.exports = DB
