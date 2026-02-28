import { useState } from "react"

interface Props {
	on_submit: (question: string) => void
	is_loading: boolean
	variant?: "hero" | "compact"
}

const SUGGESTIONS = [
	"What is Steel.dev and how does it work?",
	"Cloud browser infrastructure for AI agents",
	"Web scraping vs browser automation in 2026",
]

export function ResearchInput({ on_submit, is_loading, variant = "compact" }: Props) {
	const [question, setQuestion] = useState("")

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (question.trim() && !is_loading) {
			on_submit(question.trim())
		}
	}

	if (variant === "hero") {
		return (
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<div className="flex items-end gap-3">
					<label htmlFor="research-input" className="sr-only">Research question</label>
					<input
						id="research-input"
						type="text"
						value={question}
						onChange={(e) => setQuestion(e.target.value)}
						placeholder="What would you like to research?"
						disabled={is_loading}
						className="flex-1 border-b border-steel-border bg-transparent px-1 py-3 text-lg tracking-[-0.3px] text-steel-text placeholder:text-steel-body/60 focus:border-steel-yellow focus:outline-none focus:ring-1 focus:ring-steel-yellow/50 disabled:opacity-50"
						autoFocus
					/>
					<button
						type="submit"
						disabled={is_loading || !question.trim()}
						aria-label="Start research"
						className="cursor-pointer rounded-lg bg-steel-yellow px-6 py-3 text-sm font-medium tracking-tight text-steel-blue transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
					>
						Research
					</button>
				</div>
				<div className="flex flex-wrap justify-center gap-2">
					{SUGGESTIONS.map((q) => (
						<button
							key={q}
							type="button"
							onClick={() => setQuestion(q)}
							className="cursor-pointer rounded-full border border-steel-border px-3.5 py-1.5 text-xs tracking-tight text-steel-body transition-colors hover:bg-steel-elevated hover:text-steel-muted"
						>
							{q}
						</button>
					))}
				</div>
			</form>
		)
	}

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<input
				type="text"
				value={question}
				onChange={(e) => setQuestion(e.target.value)}
				placeholder="Ask a research question..."
				disabled={is_loading}
				className="flex-1 bg-steel-surface px-4 py-2 text-sm text-steel-text placeholder:text-steel-body focus:outline-none disabled:opacity-50"
			/>
			<button
				type="submit"
				disabled={is_loading || !question.trim()}
				className="cursor-pointer bg-steel-yellow px-4 py-2 text-xs font-medium text-steel-blue disabled:opacity-30"
			>
				{is_loading ? "..." : "Go"}
			</button>
		</form>
	)
}
