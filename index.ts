const main = async () => { if (Bun.isMainThread) await import("./lib/Server") }

main()
