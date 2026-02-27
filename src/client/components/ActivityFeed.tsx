import { useEffect, useRef } from "react"
import type { ProgressEvent } from "../../shared/types.js"

interface Props {
	events: ProgressEvent[]
}

function formatEvent(event: ProgressEvent): string {
	switch (event.type) {
		case "session_created":
			return "Browser session started"
		case "searching":
			return `Searching: "${event.query}"`
		case "visiting":
			return `Visiting: ${event.reason}`
		case "reading":
			return `Reading page ${event.page_number}/${event.total}`
		case "thinking":
			return event.thought
		case "error":
			return `Error: ${event.message}`
		case "report_ready":
			return "Report complete!"
	}
}

function eventColor(type: ProgressEvent["type"]): string {
	switch (type) {
		case "session_created": return "text-green-400"
		case "searching": return "text-yellow-400"
		case "visiting": return "text-blue-400"
		case "reading": return "text-cyan-400"
		case "thinking": return "text-zinc-400"
		case "error": return "text-red-400"
		case "report_ready": return "text-green-400"
	}
}

export function ActivityFeed({ events }: Props) {
	const ref_bottom = useRef<HTMLDivElement>(null)

	useEffect(() => {
		ref_bottom.current?.scrollIntoView({ behavior: "smooth" })
	}, [events.length])

	if (events.length === 0) {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-sm text-zinc-500">Agent activity will appear here</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-2 overflow-y-auto">
			{events.map((event, i) => (
				<div key={i} className={`text-sm ${eventColor(event.type)}`}>
					<span className="mr-2 opacity-50">{String(i + 1).padStart(2, "0")}</span>
					{formatEvent(event)}
				</div>
			))}
			<div ref={ref_bottom} />
		</div>
	)
}
