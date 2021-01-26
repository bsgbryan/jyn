const bootstrap = require('@bsgbryan/madul/bootstrap')

module.exports = sdk => {
  let log  = function() { console.log('jyn.info',     ...arguments) }
  let warn = function() { console.warn('jyn.warning', ...arguments) }

  if (sdk?.log)
    log = sdk.log

  if (sdk?.warn)
    warn = sdk.warn

  return {
    log,
    warn,
    bootstrap,
  }
}
