    require './logger'

    Server = require './server'

    Server.SEARCH_ROOT 'jyn', require.resolve '.'

    new Server().initialize().then -> console.log 'done'
