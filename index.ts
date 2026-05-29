#!/usr/bin/env bun

const main = async () => { if (Bun.isMainThread) await import("./lib/Server") }

main()
