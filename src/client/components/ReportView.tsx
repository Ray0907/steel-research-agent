import ReactMarkdown from "react-markdown"
import type { Source } from "../../shared/types.js"

interface Props {
	report: string | null
	sources: Source[]
}

export function ReportView({ report, sources }: Props) {
	if (!report) return null

	return (
		<div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
			<h2 className="mb-4 text-lg font-semibold text-zinc-100">Research Report</h2>
			<div className="prose prose-invert max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-a:text-blue-400">
				<ReactMarkdown>{report}</ReactMarkdown>
			</div>
			{sources.length > 0 && (
				<div className="mt-6 border-t border-zinc-800 pt-4">
					<h3 className="mb-2 text-sm font-medium text-zinc-400">Sources</h3>
					<ol className="list-decimal space-y-1 pl-5 text-sm">
						{sources.map((source, i) => (
							<li key={i}>
								<a
									href={source.url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-400 hover:underline"
								>
									{source.title}
								</a>
							</li>
						))}
					</ol>
				</div>
			)}
		</div>
	)
}
