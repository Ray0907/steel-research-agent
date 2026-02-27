export interface Source {
	url: string
	title: string
}

export type ProgressEvent =
	| { type: "session_created"; session_viewer_url: string; debug_url: string }
	| { type: "searching"; query: string }
	| { type: "visiting"; url: string; reason: string }
	| { type: "reading"; url: string; page_number: number; total: number }
	| { type: "thinking"; thought: string }
	| { type: "error"; message: string }
	| { type: "report_ready"; report: string; sources: Source[] }
