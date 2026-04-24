import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { runResearch } from "../agent/researcher.js"
import type { ProgressEvent } from "../../shared/types.js"

const schema_body = z.object({
	question: z.string().min(1).max(1000),
})

export async function registerResearchRoute(app: FastifyInstance) {
	app.post("/api/research", async (request, reply) => {
		const parsed = schema_body.safeParse(request.body)
		if (!parsed.success) {
			return reply.status(400).send({ error: "Invalid question" })
		}

		const { question } = parsed.data

		const steel_api_key = process.env.STEEL_API_KEY
		const anthropic_api_key = process.env.ANTHROPIC_API_KEY
		const tavily_api_key = process.env.TAVILY_API_KEY

		if (!steel_api_key || !anthropic_api_key) {
			return reply.status(500).send({ error: "Missing API keys" })
		}

		reply.raw.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		})

		const emit = (event: ProgressEvent) => {
			reply.raw.write(`data: ${JSON.stringify(event)}\n\n`)
		}

		try {
			await runResearch(question, steel_api_key, anthropic_api_key, emit, tavily_api_key)
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error"
			emit({ type: "error", message })
		} finally {
			reply.raw.end()
		}
	})
}
