import { useEffect } from "react"
import type { ResearchSession } from "../lib/types.js"
import { HistoryItem } from "./HistoryItem.js"

interface Props {
	list_sessions: ResearchSession[]
	session_selected: ResearchSession | null
	is_open: boolean
	is_loading_history: boolean
	on_select: (session: ResearchSession) => void
	on_delete: (id_session: string) => void
	on_close: () => void
}

export function HistorySidebar({
	list_sessions,
	session_selected,
	is_open,
	is_loading_history,
	on_select,
	on_delete,
	on_close,
}: Props) {
	// Close sidebar on Escape key
	useEffect(() => {
		if (!is_open) return
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") on_close()
		}
		document.addEventListener("keydown", handleKey)
		return () => document.removeEventListener("keydown", handleKey)
	}, [is_open, on_close])

	return (
		<>
			{/* Mobile overlay */}
			{is_open && (
				<div
					className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
					onClick={on_close}
				/>
			)}

			{/* Sidebar panel */}
			<aside
				aria-label="Research history"
				className={`fixed top-0 left-0 z-50 flex h-full w-72 flex-col border-r border-steel-border bg-steel-bg transition-transform duration-200 motion-reduce:transition-none lg:z-30 lg:translate-x-0 ${
					is_open ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				{/* Header */}
				<div className="flex h-14 shrink-0 items-center justify-between border-b border-steel-border/50 px-5">
					<span className="text-[11px] font-medium uppercase tracking-widest text-steel-body">
						History
					</span>
					<button
						type="button"
						aria-label="Close sidebar"
						onClick={on_close}
						className="cursor-pointer text-sm text-steel-body transition-colors hover:text-steel-text lg:hidden"
					>
						&times;
					</button>
				</div>

				{/* Session list */}
				<div className="flex-1 overflow-y-auto py-2">
					{is_loading_history ? (
						<div className="space-y-2 px-4 py-3">
							{[1, 2, 3].map(i => (
								<div key={i} className="space-y-1.5">
									<div className="h-3 w-4/5 animate-pulse rounded bg-steel-elevated" />
									<div className="h-2 w-1/3 animate-pulse rounded bg-steel-elevated" />
								</div>
							))}
						</div>
					) : list_sessions.length === 0 ? (
						<div className="px-5 py-8 text-center text-xs text-steel-body">
							No research history yet.
							<br />
							Start a new research to begin.
						</div>
					) : (
						list_sessions.map(session => (
							<HistoryItem
								key={session.id_session}
								session={session}
								is_active={session_selected?.id_session === session.id_session}
								on_select={on_select}
								on_delete={on_delete}
							/>
						))
					)}
				</div>
			</aside>
		</>
	)
}
