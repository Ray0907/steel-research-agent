import type { FastifyInstance } from "fastify"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function registerRecordingRoute(app: FastifyInstance) {
	// HLS manifest proxy — fetches m3u8 from Steel and rewrites segment URLs
	app.get("/api/sessions/:session_id/recording", async (request, reply) => {
		const { session_id } = request.params as { session_id: string }
		const steel_api_key = process.env.STEEL_API_KEY

		if (!steel_api_key) {
			return reply.status(500).send({ error: "Missing Steel API key" })
		}

		if (!UUID_RE.test(session_id)) {
			return reply.status(400).send({ error: "Invalid session ID" })
		}

		const response = await fetch(
			`https://api.steel.dev/v1/sessions/${session_id}/hls`,
			{ headers: { "steel-api-key": steel_api_key } },
		)

		if (!response.ok) {
			const text = await response.text().catch(() => "")
			app.log.warn({ status: response.status, body: text }, "Steel HLS manifest fetch failed")
			return reply.status(response.status).send({ error: "Recording not available" })
		}

		const content_type = response.headers.get("content-type") || "application/vnd.apple.mpegurl"
		let body = await response.text()

		// Rewrite absolute Steel API URLs to go through our proxy
		body = body.replace(
			/https:\/\/api\.steel\.dev\/v1\/sessions\/[^/]+\//g,
			`/api/sessions/${session_id}/recording-segment/`,
		)

		// Rewrite relative URLs (lines that don't start with / or http and aren't comments/tags)
		// HLS manifests may use relative segment paths like "segments/0.ts" or "0.ts"
		body = body.replace(
			/^(?!#)(?!https?:\/\/)(?!\/)(.+)$/gm,
			`/api/sessions/${session_id}/recording-segment/$1`,
		)

		reply.header("Content-Type", content_type)
		reply.header("Cache-Control", "no-cache")
		return reply.send(body)
	})

	// Proxy individual HLS segments (and any other referenced files)
	app.get("/api/sessions/:session_id/recording-segment/*", async (request, reply) => {
		const { session_id } = request.params as { session_id: string }
		const segment_path = (request.params as Record<string, string>)["*"]
		const steel_api_key = process.env.STEEL_API_KEY

		if (!steel_api_key) {
			return reply.status(500).send({ error: "Missing Steel API key" })
		}

		if (!UUID_RE.test(session_id)) {
			return reply.status(400).send({ error: "Invalid session ID" })
		}

		// Only allow safe segment paths (alphanumeric, hyphens, dots, slashes)
		if (!segment_path || !/^[\w./-]+$/.test(segment_path)) {
			return reply.status(400).send({ error: "Invalid segment path" })
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
