import { useState, useCallback } from "react"
import type { ProgressEvent, Source } from "../../shared/types.js"

interface ResearchState {
	is_loading: boolean
	question: string | null
	events: ProgressEvent[]
	report: string | null
	sources: Source[]
	steel_session_id: string | null
	session_viewer_url: string | null
	debug_url: string | null
	error: string | null
}

const INITIAL_STATE: ResearchState = {
	is_loading: false,
	question: null,
	events: [],
	report: null,
	sources: [],
	steel_session_id: null,
	session_viewer_url: null,
	debug_url: null,
	error: null,
}

export function useResearchStream() {
	const [state, setState] = useState<ResearchState>(INITIAL_STATE)

	const startResearch = useCallback(async (question: string) => {
		setState({ ...INITIAL_STATE, is_loading: true, question })

		try {
			const response = await fetch("/api/research", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question }),
			})

			if (!response.ok || !response.body) {
				throw new Error(`Request failed: ${response.status}`)
			}

			const reader = response.body.getReader()
			const decoder = new TextDecoder()
			let buffer = ""

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split("\n")
				buffer = lines.pop() || ""

				for (const line of lines) {
					if (!line.startsWith("data: ")) continue

					const event: ProgressEvent = JSON.parse(line.slice(6))

					setState(prev => {
						const next = { ...prev, events: [...prev.events, event] }

						if (event.type === "session_created") {
							next.steel_session_id = event.steel_session_id
							next.session_viewer_url = event.session_viewer_url
							next.debug_url = event.debug_url
						}
						if (event.type === "report_ready") {
							next.report = event.report
							next.sources = event.sources
							next.is_loading = false
						}
						if (event.type === "error") {
							next.error = event.message
							next.is_loading = false
						}

						return next
					})
				}
			}
		} catch (error) {
			setState(prev => ({
				...prev,
				is_loading: false,
				error: error instanceof Error ? error.message : "Unknown error",
			}))
		}

		// Guard: ensure is_loading is cleared even if the stream ended
		// without emitting a terminal event (report_ready or error)
		setState(prev => prev.is_loading ? { ...prev, is_loading: false } : prev)
	}, [])

	const reset = useCallback(() => {
		setState(INITIAL_STATE)
	}, [])

	return { ...state, startResearch, reset }
}
