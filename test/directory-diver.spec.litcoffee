# DirectoryDiver

This `Module` dives recursively through directories, sending information about
files it finds back to the caller.

## Overview

Below are all the test, asserions, and documentation for how `DirectoryDiver`
behaves.

## Requires

This is our class under test:

    DirectoryDiver = require './directory-diver'

This loads our assertion framework:

    chai   = require 'chai'
    expect = chai.expect

These tests use [Chai](http://chaijs.com/)'s
[expect](http://chaijs.com/guide/styles/#expect) assertion format. _Please see links
for details._

We need to include `fs` because we need to get info about the file system for some
of our tests.

    fs = require 'fs'

# Tests

    describe 'The DirectoryDiver Module', ->

      describe 'dive_for_files', ->

        it 'sends file name and path info the progress callback', (done) ->

          new DirectoryDiver()
            .initialize()
            .then (mod) ->

The logic here may look weird. This is a tricky test - specifically because the
files in our project will change over time, so how to we properly test code that
is supposed to return info about a set of data the test has no control over?

This test chooses to do three things:

1. Use core node functionality to get a snapshot of our unstable dataset we can
   test against
2. Test that our file exists in the snapshot, without checking where in the snapshot
   the file is
3. Limit the scope of the snapshot we're checking to an easy to obtain subset of
   the larger snapshot

This makes the test flexible enough to handle the changing, unstable set of files
in our project while validating that our method under test behaves as we expect.
It's extremely important that we limit our test in this way. Otherwise we'd end
up adding so much logic to our test that our test would need a test - and the
behavior we're attempting to validate would get lost in the complexity.

> **NOTE** We need those `null` statements at the end of our tests for two reasons:
>
>1. CoffeeScript works like Ruby in that the last line of any block is returned
>2. If we return a promise from our test Mocha (our tests runner) will not wait
>   for our `fs.readir` statement to complete - meaning our tests won't actually
>   execute
>
>The only way to guarantee our test executes in a situation line this is to specify
>a `done` callback (like we do in the above `it` statement) and call `done` after
>all our tests have completed.

              fs.readdir __dirname, (err, files) ->
                mod.dive_for_files()
                  .progress (file) ->
                    if file.path == __dirname
                      expect(files.indexOf file.name).to.be.greaterThan -1
                  .then -> done()
          null

This may go without saying, but `DirectoryDiver` processes subdirectories.

        it 'sends file name and path info for subdirectories', (done) ->

          new DirectoryDiver()
            .initialize()
            .then (mod) ->
              fs.readdir "#{__dirname}/routes", (err, files) ->
                mod.dive_for_files()
                  .progress (file) ->
                    if file.path == "#{__dirname}/routes"
                      expect(files.indexOf file.name).to.be.greaterThan -1
                  .then -> done()
          null
