import Fastify from "fastify"
import cors from "@fastify/cors"
import dotenv from "dotenv"
import { registerResearchRoute } from "./routes/research.js"

dotenv.config()

const app = Fastify({ logger: true })

await app.register(cors, { origin: true })
await registerResearchRoute(app)

const port = parseInt(process.env.PORT || "3001", 10)

app.listen({ port, host: "0.0.0.0" }, (err, address) => {
	if (err) {
		app.log.error(err)
		process.exit(1)
	}
	console.log(`Server listening at ${address}`)
})
