import type { ResearchSession } from "../lib/types.js"

interface Props {
	session: ResearchSession
	is_active: boolean
	on_select: (session: ResearchSession) => void
	on_delete: (id_session: string) => void
}

const STATUS_COLORS: Record<ResearchSession["status"], string> = {
	completed: "bg-steel-green",
	in_progress: "bg-steel-yellow",
	failed: "bg-red-400",
}

function formatRelativeTime(timestamp: number): string {
	const seconds = Math.floor((Date.now() - timestamp) / 1000)
	if (seconds < 60) return "just now"

	const minutes = Math.floor(seconds / 60)
	if (minutes < 60) return `${minutes}m ago`

	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `${hours}h ago`

	const days = Math.floor(hours / 24)
	if (days < 30) return `${days}d ago`

	return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function HistoryItem({ session, is_active, on_select, on_delete }: Props) {
	return (
		<div
			role="button"
			tabIndex={0}
			onClick={() => on_select(session)}
			onKeyDown={e => { if (e.key === "Enter" || e.key === " ") on_select(session) }}
			className={`group relative flex w-full cursor-pointer flex-col gap-1 border-l-2 px-4 py-3 text-left transition-colors ${
				is_active
					? "border-l-steel-yellow bg-steel-elevated"
					: "border-l-transparent hover:bg-steel-elevated/50"
			}`}
		>
			{/* Delete button */}
			<button
				type="button"
				aria-label="Delete research session"
				onClick={e => {
					e.stopPropagation()
					on_delete(session.id_session)
				}}
				className="absolute top-2.5 right-3 hidden cursor-pointer text-xs text-steel-body transition-colors hover:text-red-400 group-hover:block"
			>
				&times;
			</button>

			{/* Question */}
			<span className="line-clamp-2 pr-4 text-[13px] leading-snug text-steel-muted">
				{session.question}
			</span>

			{/* Meta row */}
			<span className="flex items-center gap-2">
				<span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[session.status]}`} />
				<span className="text-[11px] text-steel-body">
					{formatRelativeTime(session.time_created)}
				</span>
				{session.sources.length > 0 && (
					<span className="rounded-full bg-steel-border/60 px-1.5 py-px text-[10px] text-steel-body">
						{session.sources.length} sources
					</span>
				)}
			</span>
		</div>
	)
}
