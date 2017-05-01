# Server

## Overview

## Requires

This is our class under test:

    Server = require './server'

This loads our assertion framework:

    chai   = require 'chai'
    expect = chai.expect

These tests use [Chai](http://chaijs.com/)'s
[expect](http://chaijs.com/guide/styles/#expect) assertion format. _Please see links
for details._


# Tests

    describe 'The Server module', ->

      describe 'configure method', ->

        it 'initialized @app, which is the underlying Express app', (done) ->
          new Server()
            .initialize()
            .then (mod) ->
              expect(mod.app).to.be.undefined
              mod.configure()
            .then (mod) ->
              expect(mod.app).to.be.a 'function'
              done()

          null

        it "adds two middlewares:
            1. The JSON body parser
            2. Our CORS access granter", (done) ->
          new Server()
            .initialize()
            .then (mod) -> mod.configure()
            .then (mod) ->
              expect(mod.app._router.stack.length).to.equal 4
              expect(mod.app._router.stack[2].name).to.equal 'jsonParser'
              expect(mod.app._router.stack[3].name).to.equal '<anonymous>'
              done()

          null

      describe 'handle method', ->

        it 'requires configure() to be called first', (done) ->
          new Server()
            .initialize()
            .then (mod) -> mod.handle()
            .fail (reason) ->
              expect(reason).to.equal 'Server not configured yet'
              done()

          null

        it 'adds a route handler for the specified verb', (done) ->
          class TestRoute extends require './module'
            pub: [ 'get' ]

            get: => @done 'Hello, World!'

          new Server()
            .initialize()
            .then (mod) -> mod.configure()
            .then (mod) ->
              new TestRoute().initialize()
                .then (route) -> mod.handle 'get', 'test', route.get
                .then (mod) ->
                  routes = mod.app._router.stack

                  expect(routes.length).to.equal 5
                  expect(routes[4].name).to.equal 'bound dispatch'
                  expect(routes[4].route.path).to.equal '/test'
                  expect(routes[4].route.methods.get).to.be.true
                  done()

          null

      describe 'start method', ->

        it 'requires configure() to be called first', (done) ->
          new Server()
            .initialize()
            .then (mod) -> mod.start()
            .fail (reason) ->
              expect(reason).to.equal 'Server not configured yet'
              done()

          null
