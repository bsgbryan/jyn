# RouteLoader

## Overview

## Requires

This is our class under test:

    RouteLoader = require './route-loader'

This loads our assertion framework:

    chai   = require 'chai'
    expect = chai.expect

These tests use [Chai](http://chaijs.com/)'s
[expect](http://chaijs.com/guide/styles/#expect) assertion format. _Please see links
for details._


# Tests

    describe 'The RouteLoader module', ->

      it 'notifies the caller for every route it loads', (done) ->
        loaded = 0

        new RouteLoader()
          .initialize()
          .then     (mod)    -> mod.load_routes()
          .progress (route)  -> ++loaded
          .then     (routes) ->
            expect(loaded).to.equal Object.keys(routes).length
            done()

        null

      it 'passes all loaded routes to the then handler', (done) ->
        loaded = { }

        new RouteLoader()
          .initialize()
          .then     (mod)    -> mod.load_routes()
          .progress (route)  -> loaded[route.path] = route.handler
          .then     (routes) ->
            for path, handler of loaded
              expect(routes[path]).to.equal loaded[path]
            done()

        null
