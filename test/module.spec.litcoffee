# Module

This is the root of our module system. This class allows us to easily knit pieces
of functionality together.

## Overview

At its core, it's very simple. `Module` does the following:

1. Provides a simple, clean way to specify dependencies
2. Asyncronously load dependencies behind a simple method call
3. Hide details of the promise library used to orchestrate complex async workflows
4. Make knitting complex workflows simple, fun, and readable

## Classy

`Module` is a class. Modules we write will extend the `Module` class. There are
several modules declared in this way in tests below.

Most JavaScript libraries do not use a class-based system or inheritence. These
are essential to `Module`, however, because inheritence allows `Module` to act as
a facade to it's subclasses.

Having a proper contructor also gives `Module` an opportunity to wrap its inherited
classes exposed methods. This wrapping is required to decorate the vanilla module
methods with promise behavior transparently.

# Tests

Below are all the test, asserions, and documentation for how `Module` behaves.

## Requires

This is our class under test:

    Module = require './module'

This loads our assertion framework:

    chai   = require 'chai'
    expect = chai.expect

These tests use [Chai](http://chaijs.com/)'s
[expect](http://chaijs.com/guide/styles/#expect) assertion format. _Please see links
for details._

## The Good Stuff

And here is the good stuff! The following tests detail how `Module` works and the
behavior you can expect to see when using it.

    describe 'The Module class', ->

An important part of `Module` is that it passes itself to its `initialize().then`
callback. I'm sure you're thinking that this feels weird - especially since `Module`
is a class and uses inheritence. "Why use `initialize` instead of the constructor?"
I can hear you asking. Good questions!

`Module` is completely asychronous - except for it's constructor. By nature, a
constroctor cannot be asynchronous. All public-facing aspects of `Module`, however,
are asynchronous. How, then, do we hide the synchronous behavior on the constructor?
By presenting a usable `Module` instance via the `initialize().then` callback
instead of via the constructor.

By adding the extra step of the `initialize().then` callback we get the expected,
standard behavior of the constructor (to decorate subclassed module mothods) and
the beautiful, fully asynchronous behavior we want exposed to the rest of the world.

Also (importantly), `initialize` has a single task: load a modules dependencies.
A `Module` isn't ready to use until all it's dependencies have been loaded - and we're
loading dependencies asynchronously. So, when all dependencies have been loaded,
we get our decorated, ready-to-use `Module` passed to the `initialize().then`
callback.

### Instantiating a Module

The workflow for getting a `Module` you can work with is as follows:

1. Create an instance of the `Module` using the `new` keyword
2. Call the `initialize` method, passing the class-level `deps` array
3. Use what is passed to the `then` callback as you would the result of a constructor
   in normal object creation

### First Example Module

This is our example `Module`. As you can see it is extremely basic.

      class Test extends Module
        deps: [ 'q' ]

### Test Helper

This helper method simply loads our test `Module` and passes it to our assertion
callback.

      load = (cb) ->
        new Test()
          .initialize()
          .then (mod) -> cb mod

### Assertions

The initialized `Module` is passed to the  `initialize().then` callback. This allows
a module loader to register what is returned so it can be used just like a normal
module returned from `require`.

      it 'should pass itself to the initialize().then callback', ->
        load (mod) -> expect(mod).to.be.an 'object'

      it 'should add dependencies as properties to the created instance during initialization', ->
        load (mod) -> expect(mod.q).to.be.a 'function'

Sometimes dependency loading fails. If a dependency cannot be loaded initialization
of the `Module` fails.

      describe 'loading a dependency fails', ->

        it 'rejects the promise - which halts initialization', ->
          class BadDep extends Module
            deps: [ 'non_existant' ]

          new BadDep()
            .initialize()
            .fail (error) ->
              expect(error.type).to.equal 'ERROR'
              expect(error.not_loaded).to.be.an 'array'
              expect(error.not_loaded.length).to.equal 1
              expect(error.not_loaded[0]).to.equal 'non_existant'

If a dependency is not in `node_modules` the project root and all subdirectories
will be searched. When a file with a name matching the specified dependency is
found, it is loaded.

      describe 'loading a Module local to the project', ->

        it 'traverses the entire project structure looking for a matching resource', ->
          class ProjectDep extends Module
            deps: [ 'organizations' ]

          new ProjectDep()
            .initialize()
            .then (mod) ->
              expect(mod.organizations).to.be.an 'object'
              expect(mod.organizations.get).to.be.a 'function'

### Module loading order of precedence

There is an order of precedence for loading modules:

1. node modules
2. project modules

node modules are always loaded first, followed by prject modules. Any modules that
cannot be loaded will not be reported until after all project modules  have loaded.
This is because of the way modules are searched.

The search order for modules is:

1. `node_modules` (no subdirectories)
2. `.tmp` (and all subdirectories)

Only after `node_modules` and `.tmp` & all its subdirectories have been searched
will a module be reported as ubable to load.

      describe "attempting to load three modules:
                1. a node module
                2. a project module
                3. an invalid module", ->

        it "should:
            1. load the node module first
            2. load the project module second
            3. report rejection of the invalid module last", ->

          class Three extends Module
            deps: [ 'q', 'organizations', 'not_valid' ]

          loaded = 0

          new Three()
            .initialize()
            .progress (notification) ->
              if ++loaded == 1
                expect(notification.loaded).to.equal 'q'
              else if ++loaded == 2
                expect(notification.loaded).to.equal 'organizations'
            .fail (error) ->
              expect(error.type).to.equal 'ERROR'
              expect(error.not_loaded.length).to.equal 1
              expect(error.not_loaded[0]).to.equal 'not_valid'

### Decorating Module subclasses

So far our test modules have not incuded any behavior - they have only specified
dependencies. It's time to make things more interesting and show how `Module`
decorates subclass exposed methods.

_Let's go!_

    describe 'defining a public interface', ->

To be useful, a `Module` must expose funcitonality. A core tennet of a `Module`
is that it's fully asynchronous. We don't want to put the burden of `require 'q'`,
creating a `deferred`, and returning a promise on the developer, though.

A much better option would be to provide a simple, consistent api the developer
can use to communicate success, failure, and update conditions to callers.

`Module` provides this api by wrapping methods listed in the `pub` array. The
`pub` array defines the modules public interface and gives `Module` a way to know
what methods need to be wrapped in promise behavior.

In the example below, you can see that `HasPublicInterface` does not specify a
dependency on a promise library and `foo` is just and empty function - it has
nothing promise related in it. Yet once `HasPublicInterface` has been constructed
and initialized `foo` returns a promise and has `then`, `fail`, and `progress`
callbacks.

      it "wraps all methods on the instance with names matching those in the pub
          array with promises", (done) ->

        class HasPublicInterface extends Module
          pub: [ 'foo' ]

          foo: => # Look, no promises

        new HasPublicInterface()
          .initialize()
          .then (mod) ->
            expect(mod.foo().then).to.be.a 'function'
            expect(mod.foo().fail).to.be.a 'function'
            expect(mod.foo().progress).to.be.a 'function'
            done()

        null

### Promises, promises

To make things a bit clearer, let's take a look at how modules can use the api
`Module` provides to communicate with their callers asynchronously.

      it 'makes communicating with callers as simple as returning or throwing', (done) ->

        class GitErDone extends Module
          pub: [ 'workHard' ]

          workHard: =>
            [0..10].forEach (i) => @hardWork = i
            @done()

        new GitErDone()
          .initialize()
          .then (mod) ->
            mod.workHard().then ->
              expect(mod.hardWork).to.equal 10
              done()

        null

Notice that the `workHard` method isn't even asynchronous, yet it still
communicates asynchronously. _"How the heck does that work?!"_ you ask? Great
question!

As has been stated several times, **the core benefit of `Module` is that everything
is asynchronous** - _even synchronous behavior_. Such magic is achieved using nodes
`process.nextTick`. `process.nextTick` is an extremely powerful tool for orchestration.
You can learn more about it [here](https://howtonode.org/understanding-process-next-tick).

The primary reason for using `process.nextTick` is that it guarantees all methods
as asynchronous. There's no argument the developer needs to remember to pass. Without
using `process.nextTick` `Module` would not be able to handle code like that in
the test above.

> **NOTE**: The article referenced in the paragraph above presents several compelling examples
of `process.nextTick` use. The StreamLibrary example (the last one in the article)
is of particular note - as it's exactly how `process.nextTick` is used throughout
much of node itself.

**IMPORTANT NOTE** _As all the tests in this section have made clear, the `deps`
array is opitonal. If a module has no dependencies `initialize` does not need to
be called._

### Arguments (not always bad)

The `Module` api for communication has three methods:

1. `done` - For when work has been successfully completed
2. `fail` - For when work could not be completed for some reason
3. `update` - For informing the caller progress has been made

While none of these methods are technically required, at least one needs to be
called for the client to be informed anything happened.

`done` and `fail` can only be called once per method invokation.

`update` may be called more than once.

There is only one rule `Module` imposes on arguments passed to api methods:

1. Exactly zero or one argument is accepted

If more than one argument is passed to any api method, all arguments after the
first one are ignored.

      it 'accepts exactly zero or one arguments to api methods', (done) ->

        class Argumenative extends Module
          pub: [ 'ummm', 'sayWhaaat', 'honey' ]

          ummm:      => @update()
          sayWhaaat: => @fail "Oh no you didn't ..."
          honey:     => @done 'Ok', "Now it's my turn ..."


        new Argumenative()
          .initialize()
          .then (mod) ->
            mod.ummm().progress (response) ->
              expect(response).to.be.undefined

              mod.sayWhaaat().fail (response) ->
                expect(response).to.equal "Oh no you didn't ..."

                mod.honey().then (response, uhHuh) ->
                  expect(response).to.equal 'Ok'
                  expect(uhHuh).to.be.undefined
                  done()

        null

### Module api vs Caller api

You may have noticed that the api methods a module calls to communicate with a
caller are different than the methods a caller invokes to receive communication.

This is to keep the distinction between `Module` internal and `Module` external
apis clear.

The one method that has the same name in both contexts is `fail`. This is because
a name such as `error` or `exception` is too specific for either api - an invokation
could fail for reasons that don't neatly fall into the "error" or "exception"
categories.
