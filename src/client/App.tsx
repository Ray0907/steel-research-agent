import { useEffect, useRef, useCallback, useState } from "react"
import { ResearchInput } from "./components/ResearchInput.js"
import { BrowserView } from "./components/BrowserView.js"
import { ActivityFeed } from "./components/ActivityFeed.js"
import { ReportView } from "./components/ReportView.js"
import { SessionRecording } from "./components/SessionRecording.js"
import { HistorySidebar } from "./components/HistorySidebar.js"
import { useResearchStream } from "./hooks/useResearchStream.js"
import { useResearchHistory } from "./hooks/useResearchHistory.js"
import type { ResearchSession } from "./lib/types.js"

export default function App() {
	const stream = useResearchStream()
	const history = useResearchHistory()

	const id_active_session = useRef<string | null>(null)
	const [is_copied, setIsCopied] = useState(false)

	// Layout states
	const is_viewing_history = !stream.is_loading && !stream.report && history.session_selected !== null
	const is_idle = !stream.is_loading && stream.events.length === 0 && !stream.report && !is_viewing_history
	const is_done = !!stream.report

	// Wrap startResearch to persist a new session
	const handleStartResearch = useCallback(async (question: string) => {
		history.clearSelection()

		const session: ResearchSession = {
			id_session: crypto.randomUUID(),
			question,
			status: "in_progress",
			report: null,
			sources: [],
			session_viewer_url: null,
			debug_url: null,
			steel_session_id: null,
			time_created: Date.now(),
			time_updated: Date.now(),
		}

		id_active_session.current = session.id_session
		await history.persistSession(session)
		stream.startResearch(question)
	}, [history, stream])

	// When report completes, update session in DB
	useEffect(() => {
		if (!stream.report || !id_active_session.current) return

		const session: ResearchSession = {
			id_session: id_active_session.current,
			question: "",
			status: "completed",
			report: stream.report,
			sources: stream.sources,
			session_viewer_url: stream.session_viewer_url,
			debug_url: stream.debug_url,
			steel_session_id: stream.steel_session_id,
			time_created: 0,
			time_updated: Date.now(),
		}

		const existing = history.list_sessions.find(s => s.id_session === id_active_session.current)
		if (existing) {
			session.question = existing.question
			session.time_created = existing.time_created
		}

		history.persistSession(session)
	}, [stream.report]) // eslint-disable-line react-hooks/exhaustive-deps

	// Reset handler: go back to idle
	const handleReset = useCallback(() => {
		stream.reset()
		history.clearSelection()
		id_active_session.current = null
	}, [stream, history])

	// Select history item: show its report
	const handleSelectHistory = useCallback((session: ResearchSession) => {
		stream.reset()
		id_active_session.current = null
		history.selectSession(session)
	}, [stream, history])

	// Copy report as markdown
	const handleCopyMarkdown = useCallback(async () => {
		const report = is_viewing_history ? history.session_selected?.report : stream.report
		const sources = is_viewing_history ? history.session_selected?.sources : stream.sources
		if (!report) return

		let markdown = report
		if (sources && sources.length > 0) {
			markdown += "\n\n---\n\n## Sources\n\n"
			markdown += sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`).join("\n")
		}

		await navigator.clipboard.writeText(markdown)
		setIsCopied(true)
		setTimeout(() => setIsCopied(false), 2000)
	}, [is_viewing_history, history.session_selected, stream.report, stream.sources])

	// Determine what to display
	const display_report = is_viewing_history ? history.session_selected!.report : stream.report
	const display_sources = is_viewing_history ? history.session_selected!.sources : stream.sources
	const display_question = is_viewing_history
		? history.session_selected!.question
		: stream.question
	const display_steel_session_id = is_viewing_history
		? history.session_selected!.steel_session_id
		: stream.steel_session_id

	const show_report = is_done || is_viewing_history

	return (
		<div className="min-h-screen bg-steel-bg font-sans text-steel-text">
			{/* Progress bar -- z-50 sits above everything */}
			{stream.is_loading && (
				<div className="fixed top-0 right-0 left-0 z-50 h-0.5 bg-steel-border">
					<div
						className="h-full bg-steel-yellow motion-reduce:animate-none"
						style={{ animation: "progress-bar 120s ease-out forwards" }}
					/>
				</div>
			)}

			{/* History sidebar -- z-30 on desktop, z-50 on mobile overlay */}
			<HistorySidebar
				list_sessions={history.list_sessions}
				session_selected={history.session_selected}
				is_open={history.is_sidebar_open}
				is_loading_history={history.is_loading}
				on_select={handleSelectHistory}
				on_delete={history.removeSession}
				on_close={history.toggleSidebar}
			/>

			{/* Header -- z-40 between sidebar (z-30) and progress bar (z-50) */}
			<header className="fixed top-0 right-0 left-0 z-40 border-b border-steel-border/50 bg-steel-bg/80 backdrop-blur-md lg:left-72">
				<div className="flex h-14 items-center justify-between px-6">
					<div className="flex items-center gap-2.5">
						{/* Mobile hamburger */}
						<button
							type="button"
							aria-label="Toggle history sidebar"
							onClick={history.toggleSidebar}
							className="cursor-pointer text-steel-body transition-colors hover:text-steel-text lg:hidden"
						>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M3 12h18M3 6h18M3 18h18" />
							</svg>
						</button>

						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-steel-yellow" aria-hidden="true">
							<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
						</svg>
						<span className="text-sm font-semibold tracking-tight">
							<span className="text-steel-yellow">Steel</span>
							<span className="text-steel-text"> Research Agent</span>
						</span>
					</div>
					<div className="flex items-center gap-3">
						{stream.is_loading && (
							<div className="flex items-center gap-2 text-xs tracking-tight text-steel-muted">
								<span className="relative flex h-2 w-2">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-steel-green opacity-75 motion-reduce:animate-none" />
									<span className="relative inline-flex h-2 w-2 rounded-full bg-steel-green" />
								</span>
								Researching...
							</div>
						)}
						{show_report && (
							<>
								<button
									type="button"
									onClick={handleCopyMarkdown}
									className="cursor-pointer rounded-lg border border-steel-border px-3 py-1.5 text-xs font-medium text-steel-muted transition-colors hover:bg-steel-elevated hover:text-steel-text"
								>
									{is_copied ? "Copied!" : "Copy Markdown"}
								</button>
								<button
									type="button"
									onClick={handleReset}
									className="cursor-pointer rounded-lg bg-steel-yellow px-4 py-1.5 text-xs font-medium text-steel-blue transition-opacity hover:opacity-90"
								>
									New Research
								</button>
							</>
						)}
					</div>
				</div>
			</header>

			{/* Main content area -- offset by sidebar on desktop */}
			<main className="pt-14 lg:ml-72">
				{/* Idle: Centered hero */}
				{is_idle && (
					<div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6">
						<div className="relative w-full max-w-2xl text-center">
							{/* Subtle glow */}
							<div className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-steel-yellow/[0.04] blur-3xl" />

							<h1 className="relative mb-3 text-[44px] font-medium leading-tight tracking-[-1.5px] text-steel-text">
								Deep Research Agent
							</h1>
							<p className="relative mb-10 text-base tracking-[-0.3px] text-steel-body">
								AI-powered web research using Steel's cloud browser infrastructure
							</p>
							<div className="relative">
								<ResearchInput on_submit={handleStartResearch} is_loading={false} variant="hero" />
								<p className="mt-3 text-xs text-steel-body/50">
									Press <kbd className="rounded border border-steel-border bg-steel-elevated px-1.5 py-0.5 font-mono text-[10px] text-steel-muted">Enter</kbd> to research
								</p>
							</div>

							{/* Powered by */}
							<div className="relative mt-16 flex items-center justify-center gap-6 text-xs text-steel-body">
								<span>Powered by</span>
								<div className="flex items-center gap-1.5">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#F5D90A" />
									</svg>
									<span className="font-medium text-steel-muted">Steel</span>
								</div>
								<span className="text-steel-border">+</span>
								<div className="flex items-center gap-1.5">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<path d="M12 2l2 7h7l-5.5 4.5 2 7L12 16l-5.5 4.5 2-7L3 9h7z" fill="#D4A27F" />
									</svg>
									<span className="font-medium text-steel-muted">Claude</span>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Researching: Activity feed (center) + Browser view (right) */}
				{!is_idle && !is_done && !is_viewing_history && (
					<div className="space-y-4 px-6 py-6">
						{stream.error && (
							<div role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
								{stream.error}
							</div>
						)}
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
							<div className="lg:col-span-3">
								<div className="mb-2 text-[11px] font-medium uppercase tracking-widest text-steel-body">
									Agent Activity
								</div>
								<div className="h-[480px] overflow-hidden rounded-2xl border border-steel-border bg-steel-surface p-4">
									<ActivityFeed events={stream.events} />
								</div>
							</div>
							<div className="lg:col-span-2">
								<div className="mb-2 text-[11px] font-medium uppercase tracking-widest text-steel-body">
									Live Browser
								</div>
								<BrowserView
									debug_url={stream.debug_url}
									is_loading={stream.is_loading}
								/>
							</div>
						</div>
					</div>
				)}

				{/* Done / Viewing History: Question + Report */}
				{show_report && (
					<div className="space-y-6 px-6 py-6">
						{stream.error && (
							<div role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
								{stream.error}
							</div>
						)}
						{display_question && (
							<h2 className="text-lg font-medium tracking-[-0.5px] text-steel-text">
								{display_question}
							</h2>
						)}
						{display_steel_session_id && (
							<div>
								<div className="mb-2 text-[11px] font-medium uppercase tracking-widest text-steel-body">
									Session Recording
								</div>
								<SessionRecording steel_session_id={display_steel_session_id} />
							</div>
						)}
						<ReportView report={display_report} sources={display_sources} />
					</div>
				)}
			</main>
		</div>
	)
}
