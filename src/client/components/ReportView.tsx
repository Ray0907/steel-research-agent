import { lazy, Suspense, useMemo } from "react"
import type { Source } from "../../shared/types.js"
import remarkGfm from "remark-gfm"

const ReactMarkdown = lazy(() => import("react-markdown"))

/** Strip trailing "Sources" / "References" section from markdown so we don't double-render */
function stripTrailingSources(md: string): string {
	const pattern = /\n---[^\S\n]*\n+#{1,3}\s+(?:Sources|References)\b[\s\S]*$/i
	return md.replace(pattern, "").trimEnd()
}

interface Props {
	report: string | null
	sources: Source[]
}

export function ReportView({ report, sources }: Props) {
	if (!report) return null

	const report_clean = useMemo(() => stripTrailingSources(report), [report])

	return (
		<div className="rounded-2xl border border-steel-border bg-steel-surface p-8 md:p-10">
			<div className="prose prose-invert max-w-none prose-headings:font-medium prose-headings:tracking-[-0.6px] prose-headings:text-steel-text prose-h1:text-3xl prose-h2:text-xl prose-h3:text-lg prose-p:text-[15px] prose-p:leading-relaxed prose-p:tracking-[-0.3px] prose-p:text-steel-muted prose-a:text-steel-cyan prose-a:no-underline hover:prose-a:underline prose-strong:text-steel-text prose-code:font-mono prose-code:text-sm prose-code:text-steel-cyan prose-li:text-steel-muted prose-li:tracking-[-0.3px] prose-blockquote:border-l-steel-yellow prose-blockquote:text-steel-body prose-hr:border-steel-border prose-table:text-sm prose-th:text-steel-text prose-td:text-steel-muted">
				<Suspense
					fallback={
						<div className="space-y-3">
							<div className="h-4 w-48 animate-pulse rounded bg-steel-elevated" />
							<div className="h-3 w-full animate-pulse rounded bg-steel-elevated" />
							<div className="h-3 w-5/6 animate-pulse rounded bg-steel-elevated" />
							<div className="h-3 w-4/6 animate-pulse rounded bg-steel-elevated" />
						</div>
					}
				>
					<ReactMarkdown remarkPlugins={[remarkGfm]}>{report_clean}</ReactMarkdown>
				</Suspense>
			</div>

			{sources.length > 0 && (
				<div className="mt-10 border-t border-steel-border pt-6">
					<h3 className="mb-4 text-[11px] font-medium uppercase tracking-widest text-steel-body">
						Sources
					</h3>
					<ol className="list-none space-y-2.5">
						{sources.map((source, i) => (
							<li key={i} className="flex items-baseline gap-3">
								<span className="shrink-0 font-mono text-[11px] text-steel-body">
									[{i + 1}]
								</span>
								<a
									href={source.url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm tracking-tight text-steel-cyan transition-opacity hover:opacity-80"
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
