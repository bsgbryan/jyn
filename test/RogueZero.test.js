const { expect } = require('chai')

const testable = require('@bsgbryan/madul/testable')

let rz

describe('RogueZero', () => {
  before(async () => rz = await testable('/RogueZero', { log: () => {} }))

  it('is an object', () => expect(rz).to.be.an('object'))

  it('declares two deps; cluster, and /server', () => {
    expect(Array.isArray(rz.deps)).to.be.true
    expect(rz.deps[0]).to.equal('cluster')
    expect(rz.deps[1]).to.equal('/server')
  })

  describe('$launch', () => {
    it('is a function', () => expect(rz.$launch).to.be.a('function'))

    it('is an AsyncFunction', () =>
      expect(rz.$launch.constructor.name).to.equal('AsyncFunction')
    )

    describe('when cluster.isMaster is true', () => {
      it('forks processes matching the instances param', async () => {
        let   forked    = 0
        const instances = 3

        const cluster = {
          isMaster: true,
          fork: () => forked++
        }

        await rz.$launch({ cluster, instances })

        expect(forked).to.equal(instances)
      })

      it('logs a helpful message once all processes have been forked', async () => {
        let   logged
        const cluster = {
          isMaster: true,
          fork: () => {}
        }

        const sdk = {
          log: (instances, listening, port) =>
            logged = `${instances} ${listening} ${port}`
        }

        const RZ = await testable('/RogueZero', sdk)

        await RZ.$launch({ cluster, instances: 1, port: 0 })

        expect(logged).to.equal('1 worker listening on port 0')
      })
    })

    describe('when cluster.isMaster is false', () => {
      it('calls server.boot()', async () => {
        let   bootCalled = false
        const server     = { boot: () => bootCalled = true }
        const cluster    = { isMaster: false }

        await rz.$launch({ cluster, server })

        expect(bootCalled).to.be.true
      })

      it('passes the port and interval args to server.boot()', async () => {
        let portPassed, intervalPassed

        const cluster = { isMaster: false }
        const server  = {
          boot: ({ port, interval }) => {
            portPassed     = port
            intervalPassed = interval
          }
        }

        await rz.$launch({ cluster, server, port: 0, interval: 0 })

        expect(portPassed).to.equal(0)
        expect(intervalPassed).to.equal(0)
      })
    })
  })

})
