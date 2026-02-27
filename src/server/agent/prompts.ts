import type Anthropic from "@anthropic-ai/sdk"

export const SYSTEM_PROMPT = `You are a deep research agent. You have access to a web browser through tools.

Your goal: Answer the user's research question with a thorough, well-cited report.

Strategy:
1. Start by searching Google for the most relevant query
2. Review search results and visit the 3-5 most promising pages
3. Read each page's content carefully, extracting key facts
4. If you need more depth on a subtopic, search or visit additional pages
5. When you have enough information, produce your final report

Rules:
- Every factual claim MUST cite its source URL using [N] notation
- Maximum 8 page visits total to control time
- Be thorough but concise
- Structure the report with clear headings
- Include a numbered Sources section at the end
- Focus on recent, authoritative sources
- If a page's content is not useful, move on quickly`

export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
	{
		name: "search_google",
		description: "Search Google for information. Returns the top search results with titles, URLs, and snippets.",
		input_schema: {
			type: "object" as const,
			properties: {
				query: {
					type: "string",
					description: "The search query to send to Google",
				},
			},
			required: ["query"],
		},
	},
	{
		name: "visit_page",
		description: "Visit a webpage and extract its content as markdown. Use this to read articles, blog posts, documentation, etc.",
		input_schema: {
			type: "object" as const,
			properties: {
				url: {
					type: "string",
					description: "The URL of the page to visit",
				},
				reason: {
					type: "string",
					description: "Brief reason for visiting this page (shown in activity feed)",
				},
			},
			required: ["url", "reason"],
		},
	},
	{
		name: "finish_research",
		description: "Call this when you have gathered enough information. Provide the final research report with citations.",
		input_schema: {
			type: "object" as const,
			properties: {
				report: {
					type: "string",
					description: "The final research report in markdown format with [N] citations",
				},
				sources: {
					type: "array",
					items: {
						type: "object",
						properties: {
							url: { type: "string" },
							title: { type: "string" },
						},
						required: ["url", "title"],
					},
					description: "Numbered list of sources cited in the report",
				},
			},
			required: ["report", "sources"],
		},
	},
]
