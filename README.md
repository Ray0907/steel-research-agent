# Steel Research Agent

AI-powered deep web research using [Steel's](https://steel.dev) browser infrastructure. Ask a question, watch an AI agent browse the web in real-time, and get a comprehensive research report with cited sources.

## Features

- **Live Browser View** -- Watch the AI agent navigate, search, and read web pages in real-time via Steel's session embedding
- **Claude-Powered Research** -- Uses Claude's tool-use API to autonomously decide what to search, which pages to read, and when to synthesize findings
- **Cited Reports** -- Every claim in the final report is backed by numbered source citations
- **Real-Time Activity Feed** -- See the agent's thought process and progress as it works

## Architecture

```
React + Tailwind (Vite)
    | SSE
    v
Fastify (TypeScript)
    |              |
    v              v
Claude API    Steel Sessions API
                   |
                   v
              Playwright
```

## Steel Features Used

- **Sessions API** -- Create and manage cloud browser instances
- **Session Embedding** -- Live iframe view of the browser via `debugUrl`
- **Scrape API** -- Extract page content as clean markdown
- **Playwright Integration** -- Full browser control via CDP WebSocket

## Tech Stack

Deliberately mirrors Steel's own stack for day-one readiness:

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, Vite |
| Backend | Fastify, TypeScript |
| AI | Claude API (Anthropic SDK) |
| Browser | Steel SDK, Playwright |
| Realtime | Server-Sent Events (SSE) |

## Setup

```bash
# Clone and install
git clone <repo-url>
cd steel-research-agent
pnpm install

# Configure API keys
cp .env.example .env
# Edit .env with your STEEL_API_KEY and ANTHROPIC_API_KEY

# Run development servers
pnpm dev
```

Get your Steel API key at [app.steel.dev](https://app.steel.dev/settings/api-keys).

## Usage

1. Open http://localhost:5173
2. Enter a research question
3. Watch the AI agent browse the web in the left panel
4. Follow the agent's progress in the right panel
5. Read the final research report with citations

## CLI Testing

```bash
# Start the server
pnpm dev:server

# In another terminal
pnpm test:cli "What are the top browser automation frameworks for AI agents?"
```
