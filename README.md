![NPM](https://img.shields.io/npm/l/@bsgbryan/jyn) ![GitHub top language](https://img.shields.io/github/languages/top/bsgbryan/jyn) ![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/bsgbryan/jyn) ![GitHub last commit (branch)](https://img.shields.io/github/last-commit/bsgbryan/jyn/master)

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

For command options, execute `jyn --help`

# Handling requests

jyn is built on [Mädūl](https://github.com/bsgbryan/madul). It bootstraps and invokes the madul specified by the `action` property of the JSON web socket request, executes the method requested, and returns the results.

What does this look like in practice?

1. `mkdir ~/jyn_test && cd ~/jyn_test`
1. `npm install -g wscat`
1. `jyn`
1. ``echo 'const madul = { greet: ({ name }) => `Hello ${name}!` }\n' > ./casian.js``
1. `wscat -c ws://localhost:1138`
1. `{"action": "casian.greet", "name": "World"}`

This should result in the response `{result: "Hello World!"}`
