import { ResearchInput } from "./components/ResearchInput.js"
import { BrowserView } from "./components/BrowserView.js"
import { ActivityFeed } from "./components/ActivityFeed.js"
import { ReportView } from "./components/ReportView.js"
import { useResearchStream } from "./hooks/useResearchStream.js"

export default function App() {
	const {
		is_loading,
		events,
		report,
		sources,
		debug_url,
		error,
		startResearch,
	} = useResearchStream()

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100">
			<header className="border-b border-zinc-800 px-6 py-4">
				<div className="mx-auto flex max-w-7xl items-center justify-between">
					<div>
						<h1 className="text-xl font-semibold">Steel Research Agent</h1>
						<p className="text-sm text-zinc-400">
							AI-powered deep web research using Steel's browser infrastructure
						</p>
					</div>
					{is_loading && (
						<div className="flex items-center gap-2 text-sm text-blue-400">
							<div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
							Researching...
						</div>
					)}
				</div>
			</header>

			<main className="mx-auto max-w-7xl space-y-6 p-6">
				<ResearchInput on_submit={startResearch} is_loading={is_loading} />

				{error && (
					<div className="rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
						{error}
					</div>
				)}

				{(is_loading || events.length > 0) && (
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<div>
							<h2 className="mb-3 text-sm font-medium text-zinc-400">Live Browser</h2>
							<BrowserView debug_url={debug_url} is_loading={is_loading} />
						</div>
						<div>
							<h2 className="mb-3 text-sm font-medium text-zinc-400">Agent Activity</h2>
							<div className="h-[400px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
								<ActivityFeed events={events} />
							</div>
						</div>
					</div>
				)}

				<ReportView report={report} sources={sources} />
			</main>
		</div>
	)
}
