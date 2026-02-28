import { fileURLToPath } from "node:url"
import path from "node:path"
import Fastify from "fastify"
import cors from "@fastify/cors"
import fastifyStatic from "@fastify/static"
import dotenv from "dotenv"
import { registerResearchRoute } from "./routes/research.js"
import { registerRecordingRoute } from "./routes/recording.js"

dotenv.config()

const app = Fastify({ logger: true })

await app.register(cors, { origin: true })
await registerResearchRoute(app)
await registerRecordingRoute(app)

// Serve built frontend in production
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const client_dist = path.join(__dirname, "../client")

await app.register(fastifyStatic, {
	root: client_dist,
	wildcard: false,
})

// SPA fallback: serve index.html for non-API routes
app.setNotFoundHandler((request, reply) => {
	if (request.url.startsWith("/api")) {
		reply.status(404).send({ error: "Not found" })
	} else {
		reply.sendFile("index.html")
	}
})

const port = parseInt(process.env.PORT || "3001", 10)

app.listen({ port, host: "0.0.0.0" }, (err, address) => {
	if (err) {
		app.log.error(err)
		process.exit(1)
	}
	console.log(`Server listening at ${address}`)
})
