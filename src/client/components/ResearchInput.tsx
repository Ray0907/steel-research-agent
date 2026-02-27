import { useState } from "react"

interface Props {
	on_submit: (question: string) => void
	is_loading: boolean
}

export function ResearchInput({ on_submit, is_loading }: Props) {
	const [question, setQuestion] = useState("")

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (question.trim() && !is_loading) {
			on_submit(question.trim())
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex gap-3">
			<input
				type="text"
				value={question}
				onChange={e => setQuestion(e.target.value)}
				placeholder="Ask a research question..."
				disabled={is_loading}
				className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
			/>
			<button
				type="submit"
				disabled={is_loading || !question.trim()}
				className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{is_loading ? "Researching..." : "Research"}
			</button>
		</form>
	)
}
