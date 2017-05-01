    Bootstrapper = require './bootstrapper'

    new Bootstrapper().initialize().then (mod) -> mod.bootstrap()
