const { expect } = require('chai')

const testable = require('@bsgbryan/madul/testable')

let server

let sdk = {
  log:       () => {},
  warn:      () => {},
  bootstrap: () => {},
}

describe('server', () => {
  before(async () => server = await testable('/server', sdk))

  it('is an object', () => expect(server).to.be.an('object'))

  it('declares one dep; ws', () => {
    expect(Array.isArray(server.deps)).to.be.true
    expect(server.deps[0]).to.equal('ws')
  })

  it('declares a boot method', () =>
    expect(server.boot).to.be.a('function')
  )

  describe('server.boot', () => {
    it('is NOT an AsyncFunction', () =>
      expect(server.boot.constructor.name).to.equal('Function')
    )

    it('creates a new ws.Server when called', () => {
      let serverConstructed = false

      const ws = {
        Server: class {
          constructor() {
            serverConstructed = true

            return {
              on: () => {},
              clients: []
            }
          }
        }
      }

      server.boot({ ws })

      expect(serverConstructed).to.be.true
    })

    it('registers an error listener', () => {
      let errorHandlerRegistered

      const ws = {
        Server: class {
          constructor() {
            return {
              on: (event, handler) => {
                if (event === 'error')
                  errorHandlerRegistered = handler
              },
              clients: []
            }
          }
        }
      }
      server.boot({ ws })

      expect(errorHandlerRegistered).to.equal(sdk.warn)
    })

    it('registers a connection listener', () => {
      let connecitonHandlerRegistered

      const ws = {
        Server: class {
          constructor() {
            return {
              on: (event, handler) => {
                if (event === 'connection')
                  connecitonHandlerRegistered = handler
              },
              clients: []
            }
          }
        }
      }
      server.boot({ ws })

      expect(connecitonHandlerRegistered).to.be.a('function')
    })

    describe('the connection handler', () => {
      let connectionHandler

      const wss = {
        Server: class {
          constructor() {
            return {
              on: (event, handler) => {
                if (event === 'connection')
                  connectionHandler = handler
              },
              clients: []
            }
          }
        }
      }
      it('is NOT an AsyncFunction', () => {
        server.boot({ ws: wss })

        expect(connectionHandler.constructor.name).to.equal('Function')
      })

      it('sets isAlive to true on the socket', () => {
        server.boot({ ws: wss })

        let ws = {
          isAlive: false,
          on: () => {}
        }

        connectionHandler(ws)

        expect(ws.isAlive).to.be.true
      })

      it('registers a pong event listener', () => {
        let pongHandler

        server.boot({ ws: wss })

        let ws = {
          on: (event, handler) => {
            if (event === 'pong')
              pongHandler = handler
          }
        }

        connectionHandler(ws)

        expect(pongHandler).to.be.a('function')
      })

      it('registers a message event listener', () => {
        let messageHandler

        server.boot({ ws: wss })

        let ws = {
          on: (event, handler) => {
            if (event === 'message')
              messageHandler = handler
          }
        }

        connectionHandler(ws)

        expect(messageHandler).to.be.a('function')
      })

      it('registers an error event listener', () => {
        let errorHandler

        server.boot({ ws: wss })

        let ws = {
          on: (event, handler) => {
            if (event === 'error')
              errorHandler = handler
          }
        }

        connectionHandler(ws)

        expect(errorHandler).to.equal(sdk.warn)
      })

      describe('the pong event listener', () => {
        let ws, pongHandler

        before(() => {
          server.boot({ ws: wss })

          ws = {
            on: (event, handler) => {
              if (event === 'pong')
                pongHandler = handler
            }
          }

          connectionHandler(ws)
        })

        it('is NOT an AsyncFunction', () =>
          expect(pongHandler.constructor.name).to.equal('Function')
        )

        it('sets ws.isAlive to true', () => {
          ws.isAlive = false

          pongHandler()

          expect(ws.isAlive).to.be.true
        })
      })

      describe('the message event listener', () => {
        let ws, messageHandler, response

        before(() => {
          server.boot({ ws: wss })

          ws = {
            on: (event, handler) => {
              if (event === 'message')
                messageHandler = handler
            },
            send: res => response = res
          }

          connectionHandler(ws)
        })

        it('is an AsyncFunction', () =>
          expect(messageHandler.constructor.name).to.equal('AsyncFunction')
        )

        it('sends an error message if input cannot be parse as JSON', async () => {
          await messageHandler('Not JSON')

          expect(response).to.equal('{"error": "Could not parse request"}')
        })

        it('executes the specified action, returning the result', async () => {
          await messageHandler('{"action": "test.greet", "name": "Mary Jackson"}')

          expect(response).to.equal('{"result": "Hello Mary Jackson!"}')
        })

        it('returns an error message if an Error is thrown during action execution', async () => {
          await messageHandler('{"action": "test.error"}')

          expect(response).to.equal('{"error": "Example error message"}')
        })

        describe('response types', () => {
          describe('function', () => {
            it('is not allowed and returns an error message', async () => {
              await messageHandler('{"action": "test.fn"}')

              expect(response).to.equal('{"error": "functions are not allowed as results"}')
            })
          })

          describe('object', () => {
            it('is nested under the top level result key', async () => {
              await messageHandler('{"action": "test.object"}')

              expect(response).to.equal('{"result": {"example":"response"}}')
              expect(JSON.parse(response).result).to.be.an('object')
            })
          })

          describe('string', () => {
            it('is returned as the value for top level result key', async () => {
              await messageHandler('{"action": "test.string"}')

              expect(response).to.equal('{"result": "This is a string, yay!"}')
              expect(JSON.parse(response).result).to.be.a('string')
            })
          })

          describe('number', () => {
            it('is returned as the value for top level result key, and has the correct type', async () => {
              await messageHandler('{"action": "test.number"}')

              expect(response).to.equal('{"result": 42}')
              expect(JSON.parse(response).result).to.be.a('number')
            })
          })

          describe('boolean', () => {
            it('is returned as the value for top level result key, and has the correct type', async () => {
              await messageHandler('{"action": "test.bool"}')

              expect(response).to.equal('{"result": false}')
              expect(JSON.parse(response).result).to.be.a('boolean')
            })
          })

          describe('null', () => {
            it('is returned as the value for top level result key, and has the correct type', async () => {
              await messageHandler('{"action": "test.null"}')

              expect(response).to.equal('{"result": null}')
              expect(JSON.parse(response).result).to.be.null
            })
          })

          describe('undefined', () => {
            it('is returned as null', async () => {
              await messageHandler('{"action": "test.undefined"}')

              expect(response).to.equal('{"result": null}')
              expect(JSON.parse(response).result).to.be.null
            })
          })
        })

        describe('meta data', () => {
          const placeholderReq = { headers: { 'x-forwarded-for': '127.0.0.1' } }

          let res

          before(async () => {
            server.boot({ ws: wss })

            ws = {
              on: (event, handler) => {
                if (event === 'message')
                  messageHandler = handler
              },
              send: res => response = res
            }

            connectionHandler(ws, placeholderReq)

            await messageHandler('{"action": "test.meta"}')

            res = JSON.parse(response).result
          })

          it('includes the madul, method, raw_ip, ip_v4, and ip_v6 properties', async () => {
            const keys = Object.keys(res)

            expect(keys.includes('madul')).to.be.true
            expect(keys.includes('method')).to.be.true
            expect(keys.includes('raw_ip')).to.be.true
            expect(keys.includes('ip_v4')).to.be.true
            expect(keys.includes('ip_v6')).to.be.true
          })

          it('maps the madul property to the madul specified in the action', async () =>
            expect(res.madul).to.equal('test')
          )

          it('maps the method property to the method specified in the action', async () =>
            expect(res.method).to.equal('meta')
          )

          describe('ip address processing', () => {
            describe('ip v4 addresses', () => {
              describe('when the x-forwarded-for header is present', () => {
                const placeholderReq = { headers: { 'x-forwarded-for': '127.0.0.1' } }

                let res

                before(async () => {
                  connectionHandler(ws, placeholderReq)

                  await messageHandler('{"action": "test.meta"}')

                  res = JSON.parse(response).result
                })

                it('maps the raw_ip property to the unprocessed value of the x-forwarded-for header', async () =>
                  expect(res.raw_ip).to.equal('127.0.0.1')
                )

                it('maps the ip_v4 property to the processed value of the x-forwarded-for header', async () =>
                  expect(res.ip_v4).to.equal('127.0.0.1')
                )

                it('maps the ip_v6 property to null', async () =>
                  expect(res.ip_v6).to.be.null
                )
              })

              describe('when the connection.remoteAddress property is present', () => {
                const placeholderReq = { headers: {}, connection: { remoteAddress: '127.0.0.1' } }

                let res

                before(async () => {
                  connectionHandler(ws, placeholderReq)

                  await messageHandler('{"action": "test.meta"}')

                  res = JSON.parse(response).result
                })

                it('maps the raw_ip property to the unprocessed value of the connection.remoteAddress property', async () =>
                  expect(res.raw_ip).to.equal('127.0.0.1')
                )

                it('maps the ip_v4 property to the processed value of the connection.remoteAddress property', async () =>
                  expect(res.ip_v4).to.equal('127.0.0.1')
                )

                it('maps the ip_v6 property to null', async () =>
                  expect(res.ip_v6).to.be.null
                )
              })
            })

            describe('ip v6 addresses', () => {
              describe('when the x-forwarded-for header is present', () => {
                const placeholderReq = { headers: { 'x-forwarded-for': '2001:0:3238:DFE1:63::FEFB' } }

                let res

                before(async () => {
                  connectionHandler(ws, placeholderReq)

                  await messageHandler('{"action": "test.meta"}')

                  res = JSON.parse(response).result
                })

                it('maps the raw_ip property to the unprocessed value of the x-forwarded-for header', async () =>
                  expect(res.raw_ip).to.equal('2001:0:3238:DFE1:63::FEFB')
                )

                it('maps the ip_v6 property to the processed value of the x-forwarded-for header', async () =>
                  expect(res.ip_v6).to.equal('2001:0:3238:DFE1:63::FEFB')
                )

                it('maps the ip_v4 property to null', async () =>
                  expect(res.ip_v4).to.be.null
                )
              })

              describe('when the connection.remoteAddress property is present', () => {
                const placeholderReq = { headers: {}, connection: { remoteAddress: '2001:0:3238:DFE1:63::FEFB' } }

                let res

                before(async () => {
                  connectionHandler(ws, placeholderReq)

                  await messageHandler('{"action": "test.meta"}')

                  res = JSON.parse(response).result
                })

                it('maps the raw_ip property to the unprocessed value of the connection.remoteAddress property', async () =>
                  expect(res.raw_ip).to.equal('2001:0:3238:DFE1:63::FEFB')
                )

                it('maps the ip_v6 property to the processed value of the connection.remoteAddress property', async () =>
                  expect(res.ip_v6).to.equal('2001:0:3238:DFE1:63::FEFB')
                )

                it('maps the ip_v4 property to null', async () =>
                  expect(res.ip_v4).to.be.null
                )
              })
            })

            describe('an address that cannot be processed', () => {
              const placeholderReq = { headers: { 'x-forwarded-for': 'invalid' } }

              let res

              before(async () => {
                connectionHandler(ws, placeholderReq)

                await messageHandler('{"action": "test.meta"}')

                res = JSON.parse(response).result
              })

              it('sets the raw_ip property to the uprocessed value', () =>
                expect(res.raw_ip).to.equal('invalid')
              )

              it('sets the ip_v4 property to null', () =>
                expect(res.ip_v4).to.be.null
              )

              it('sets the ip_v6 property to null', () =>
                expect(res.ip_v6).to.be.null
              )
            })

            describe('no data passed for either the x-forwarded-for header or connection.remoteAddress property', () => {
              const placeholderReq = { }

              let res

              before(async () => {
                connectionHandler(ws, placeholderReq)

                await messageHandler('{"action": "test.meta"}')

                res = JSON.parse(response).result
              })

              it('raw_ip is undefined', () =>
                expect(res.raw_ip).to.be.undefined
              )

              it('sets the ip_v4 property to null', () =>
                expect(res.ip_v4).to.be.null
              )

              it('sets the ip_v6 property to null', () =>
                expect(res.ip_v6).to.be.null
              )
            })
          })
        })

        describe('when a nonexistant method on a valid madul is reuested', () => {
          it("sends an error response with the error's message", async () => {
            await messageHandler('{"action": "test.nonexistant"}')

            expect(response).to.equal('{"error": "test.nonexistant is not a valid action"}')
          })
        })

        describe('when a nonexistant madul is reuested', () => {
          it("sends an error response with the error's message", async () => {
            await messageHandler('{"action": "nonexistant.fn"}')

            expect(response).to.equal('{"error": "nonexistant does not exist"}')
          })
        })
      })
    })
  })
})
