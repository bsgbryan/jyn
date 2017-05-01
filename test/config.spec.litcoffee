# Config

## Overview

## Requires

This is our class under test:

    Config = require './config'

This loads our assertion framework:

    chai   = require 'chai'
    expect = chai.expect

These tests use [Chai](http://chaijs.com/)'s
[expect](http://chaijs.com/guide/styles/#expect) assertion format. _Please see links
for details._


# Tests

    describe 'The Config module', ->

      instantiate = (cb) -> new Config().initialize().then (mod) -> cb mod

      it 'parses .env on initialize()', (done) ->
        instantiate (config) ->
          expect(config.APP_ROOT).to.equal '.tmp'
          done()

        null

      it 'properly handles arrays', (done) ->
        instantiate (config) ->
          expect(config.VALID_VERBS).to.be.an 'array'
          done()

        null

      it 'properly handles integers', (done) ->
        instantiate (config) ->
          expect(config.SERVER_PORT).to.be.a 'number'
          done()

        null
