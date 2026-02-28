import type { Source } from "../../shared/types.js"

export interface ResearchSession {
	id_session: string
	question: string
	status: "in_progress" | "completed" | "failed"
	report: string | null
	sources: Source[]
	session_viewer_url: string | null
	debug_url: string | null
	steel_session_id: string | null
	time_created: number
	time_updated: number
}
