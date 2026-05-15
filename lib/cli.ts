import { isPrimary } from "cluster"

if (isPrimary) await import("./Server")
