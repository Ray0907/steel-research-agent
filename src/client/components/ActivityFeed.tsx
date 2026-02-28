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
			return `Searching "${event.query}"`
		case "visiting":
			return event.reason
		case "reading":
			return `Reading page ${event.page_number}/${event.total}`
		case "thinking":
			return event.thought
		case "error":
			return event.message
		case "report_ready":
			return "Report complete"
	}
}

function dotColor(type: ProgressEvent["type"]): string {
	switch (type) {
		case "session_created":
		case "report_ready":
			return "bg-steel-green"
		case "searching":
			return "bg-steel-yellow"
		case "visiting":
		case "reading":
			return "bg-steel-cyan"
		case "thinking":
			return "bg-steel-body"
		case "error":
			return "bg-red-400"
	}
}

function labelText(type: ProgressEvent["type"]): string | null {
	switch (type) {
		case "session_created":
			return "INIT"
		case "searching":
			return "SEARCH"
		case "visiting":
			return "VISIT"
		case "reading":
			return "READ"
		case "thinking":
			return null
		case "error":
			return "ERROR"
		case "report_ready":
			return "DONE"
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
				<p className="text-xs text-steel-body">Agent activity will appear here</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col overflow-y-auto pr-1">
			{events.map((event, i) => {
				const label = labelText(event.type)
				return (
					<div
						key={i}
						className="group flex animate-[fade-in_200ms_ease-out] items-start gap-3 border-l border-steel-border py-2 pl-4"
					>
						<div
							className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor(event.type)}`}
						/>
						<div className="min-w-0 flex-1">
							{label && (
								<span className="mr-2 font-mono text-[10px] tracking-wider text-steel-body">
									{label}
								</span>
							)}
							<span
								className={`text-xs leading-relaxed ${event.type === "error" ? "text-red-400" : "text-steel-muted"}`}
							>
								{formatEvent(event)}
							</span>
						</div>
					</div>
				)
			})}
			<div ref={ref_bottom} />
		</div>
	)
}
