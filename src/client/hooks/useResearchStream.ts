import { useState, useCallback } from "react"
import type { ProgressEvent, Source } from "../../shared/types.js"

interface ResearchState {
	is_loading: boolean
	events: ProgressEvent[]
	report: string | null
	sources: Source[]
	session_viewer_url: string | null
	debug_url: string | null
	error: string | null
}

export function useResearchStream() {
	const [state, setState] = useState<ResearchState>({
		is_loading: false,
		events: [],
		report: null,
		sources: [],
		session_viewer_url: null,
		debug_url: null,
		error: null,
	})

	const startResearch = useCallback(async (question: string) => {
		setState({
			is_loading: true,
			events: [],
			report: null,
			sources: [],
			session_viewer_url: null,
			debug_url: null,
			error: null,
		})

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

		setState(prev => ({ ...prev, is_loading: false }))
	}, [])

	const reset = useCallback(() => {
		setState({
			is_loading: false,
			events: [],
			report: null,
			sources: [],
			session_viewer_url: null,
			debug_url: null,
			error: null,
		})
	}, [])

	return { ...state, startResearch, reset }
}
