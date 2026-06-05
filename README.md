# Jyn

A simple, fun, fully asynchronous web socket & http server

# Install

```sh
curl -fsSL https://bun.com/install | bash # install bun
bun i -g @bsgbryan/jyn # install jyn globally
```

# Usage

```sh
jyn # run jyn
```

That's it. _Really_.

For command options, execute `jyn --help`

# Handling requests

jyn is built on [Mädūl](https://github.com/bsgbryan/madul). It bootstraps and invokes the madul specified by the `madul` property of the JSON web socket request, executes the default export, and returns the results.

What does this look like in practice?

1. `bun init jyn_test`
1. Add `"paths": { "+*": ["./*"] }` to the end of the `compilerOptions` section of the newly-created `jyn_test/tsconfig.json`
1. `bun i -g wscat`
1. `jyn`
1. ``echo 'export default ({ message: { name }, session_id }) => postMessage({content: `Hello ${name}!`, session_id, format: "TEXT"})\n' > ./greet.ts``
1. `wscat -c ws://localhost:1138`
1. `{"madul": "+greet", "content": {"name": "World"}}`

Which produces the response `{"format":"TEXT","content":"Hello World!"}`

# Why Bun?

Because it's awesome. It's super-fast, fun to work with, and comes with a ton of great tooling out-of-the-box.

Would you like to know [more](https://bun.com)?
