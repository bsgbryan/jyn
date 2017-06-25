    Server = require './server'

    new Server().initialize().then -> console.log 'done'
