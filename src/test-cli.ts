import dotenv from "dotenv"
dotenv.config()

const question = process.argv[2] || "What are the top browser automation frameworks for AI agents in 2025?"

console.log(`Researching: ${question}\n`)

const response = await fetch("http://localhost:3001/api/research", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ question }),
})

if (!response.ok || !response.body) {
	console.error("Request failed:", response.status)
	process.exit(1)
}

const reader = response.body.getReader()
const decoder = new TextDecoder()
let buffer = ""

while (true) {
	const { done, value } = await reader.read()
	if (done) break

	buffer += decoder.decode(value, { stream: true })
	const lines = buffer.split("\n")
	buffer = lines.pop() || ""

	for (const line of lines) {
		if (line.startsWith("data: ")) {
			const event = JSON.parse(line.slice(6))

			switch (event.type) {
				case "session_created":
					console.log(`[Browser] Live view: ${event.session_viewer_url}`)
					break
				case "searching":
					console.log(`[Search] "${event.query}"`)
					break
				case "visiting":
					console.log(`[Visit] ${event.url} - ${event.reason}`)
					break
				case "reading":
					console.log(`[Read] Page ${event.page_number}/${event.total}`)
					break
				case "thinking":
					console.log(`[Think] ${event.thought}`)
					break
				case "error":
					console.error(`[Error] ${event.message}`)
					break
				case "report_ready":
					console.log("\n" + "=".repeat(60))
					console.log("RESEARCH REPORT")
					console.log("=".repeat(60))
					console.log(event.report)
					console.log("\nSources:")
					event.sources.forEach((s: { url: string; title: string }, i: number) => {
						console.log(`[${i + 1}] ${s.title} - ${s.url}`)
					})
					break
			}
		}
	}
}
