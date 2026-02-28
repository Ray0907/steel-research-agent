interface Props {
	debug_url: string | null
	is_loading: boolean
}

export function BrowserView({ debug_url, is_loading }: Props) {
	const embed_url = debug_url ? `${debug_url}?interactive=false` : null

	if (!embed_url) {
		return (
			<div className="flex h-[480px] items-center justify-center rounded-2xl border border-steel-border bg-steel-surface">
				{is_loading ? (
					<div className="flex flex-col items-center gap-3">
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-steel-border border-t-steel-yellow" />
						<p className="text-xs tracking-tight text-steel-body">
							Starting browser session...
						</p>
					</div>
				) : (
					<p className="text-xs text-steel-body">Browser view will appear here</p>
				)}
			</div>
		)
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-steel-border">
			<iframe
				src={embed_url}
				className="h-[480px] w-full bg-steel-surface"
				allow="autoplay"
				title="Steel Live Browser"
			/>
		</div>
	)
}
