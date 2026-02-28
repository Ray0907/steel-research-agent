import type { FastifyInstance } from "fastify"

export async function registerRecordingRoute(app: FastifyInstance) {
	// FIXME: recording video not rendering yet; session_id and segment_path need input validation (SSRF risk)
	app.get("/api/sessions/:session_id/recording", async (request, reply) => {
		const { session_id } = request.params as { session_id: string }
		const steel_api_key = process.env.STEEL_API_KEY

		if (!steel_api_key) {
			return reply.status(500).send({ error: "Missing Steel API key" })
		}

		const response = await fetch(
			`https://api.steel.dev/v1/sessions/${session_id}/hls`,
			{ headers: { "steel-api-key": steel_api_key } },
		)

		if (!response.ok) {
			return reply.status(response.status).send({ error: "Failed to fetch recording" })
		}

		const content_type = response.headers.get("content-type") || "application/vnd.apple.mpegurl"
		let body = await response.text()

		// Rewrite absolute segment URLs in the m3u8 to go through our proxy
		body = body.replace(
			/https:\/\/api\.steel\.dev\/v1\/sessions\/[^/]+\//g,
			`/api/sessions/${session_id}/recording-segment/`,
		)

		reply.header("Content-Type", content_type)
		reply.header("Cache-Control", "no-cache")
		return reply.send(body)
	})

	// Proxy individual HLS segments
	app.get("/api/sessions/:session_id/recording-segment/*", async (request, reply) => {
		const { session_id } = request.params as { session_id: string }
		const segment_path = (request.params as Record<string, string>)["*"]
		const steel_api_key = process.env.STEEL_API_KEY

		if (!steel_api_key) {
			return reply.status(500).send({ error: "Missing Steel API key" })
		}

		const response = await fetch(
			`https://api.steel.dev/v1/sessions/${session_id}/${segment_path}`,
			{ headers: { "steel-api-key": steel_api_key } },
		)

		if (!response.ok) {
			return reply.status(response.status).send({ error: "Failed to fetch segment" })
		}

		const content_type = response.headers.get("content-type") || "video/mp2t"
		const buffer = Buffer.from(await response.arrayBuffer())

		reply.header("Content-Type", content_type)
		reply.header("Cache-Control", "public, max-age=3600")
		return reply.send(buffer)
	})
}
