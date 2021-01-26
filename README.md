# Jyn

A simple, fun, fully asynchronous web socket server

# Install

```sh
npm install -g @bsgbryan/jyn
```

# Usage

```sh
jyn
```

That's it. _Really_.

### A bit more detail

jyn is built on [Mädūl](https://github.com/bsgbryan/madul). It bootstraps and invokes the madul specified by the `action` property of the JSON web socket request, executes the method requested, and returns the results.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
