interface Props {
	debug_url: string | null
	is_loading: boolean
}

export function BrowserView({ debug_url, is_loading }: Props) {
	if (!debug_url) {
		return (
			<div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50">
				{is_loading ? (
					<div className="flex flex-col items-center gap-3">
						<div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
						<p className="text-sm text-zinc-500">Starting browser session...</p>
					</div>
				) : (
					<p className="text-sm text-zinc-500">Browser view will appear here</p>
				)}
			</div>
		)
	}

	return (
		<div className="overflow-hidden rounded-lg border border-zinc-800">
			<iframe
				src={`${debug_url}?interactive=false`}
				className="h-full w-full"
				style={{ minHeight: "400px" }}
				title="Live Browser Session"
			/>
		</div>
	)
}
