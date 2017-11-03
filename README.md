# Jyn

A simple, fun, fully asynchronous api framework - built on [Madul](https://github.com/bsgbryan/madul)

# Install

```sh
npm install -g jyn
```

# Usage

```sh
jyn
```

That's it. Really.

# Alternate install and usage option

You can install and run Jyn locally. This works well in a hosted environment where `sudo` doesn't have access to your user's environment.

```sh
npm install --save jyn
./node_modules/jyn/dist/cli.js
```

# What exactly is Jyn?

Jyn is a WebSocket server. It does not handle HTTP requests.

## How does Jyn handle requests?

Jyn understands one data type: JSON

Every JSON request Jyn received must have two fields: `MODULE` and `ACTION`.

### MODULE

`MODULE` is the name of the madul to execute. This name maps directly to a file name in the project Jyn was started in. By default, Jyn starts searching for files in the `dist` directory. When a file who's name matches the `MODULE` argument is found that file is initialized.

**IMPORTANT NOTE** Jyn only understands how to load and call [madul](https://github.com/bsgbryan/madul)s. Jyn loads the requested `MODULE` using Madul's standard initialization process.

### ACTION

`ACTION` is the name of the method on the requested `MODULE` to execute.

### Other args

All other properties on the JSON message are passed to `ACTION` as an arguments object.

# Example

The following shows everything you need to have Jyn setup, running, and serving requests.

### npm installs && vim

```sh
npm install -g jyn wscat coffee-script@1.12.7
npm install madul

vim ./hello.coffee
```

### ./hello.coffee

```coffeescript
Madul = require 'madul'

class Hello extends Madul
  
  say_hi: (input, done) ->
    done "Hello, #{input.name}!"

module.exports = Hello
```

Compile the CoffeeScript

```sh
coffee -o dist -c ./hello.coffee
```

### Jyn boot

```sh
jyn # From the same directory as hello.coffee
```

### wscat

Start the WebSocket client

```sh
wscat -c ws://localhost:1138
```

Then send a request

```sh
{"MODULE":"hello", "ACTION":"say_hi","name":"Joe"}
```

Which will send back

```sh
< {"status":"COMPLETE","data":"Hello, Joe!"}
```

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
