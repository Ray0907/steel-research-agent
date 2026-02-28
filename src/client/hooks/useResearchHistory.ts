import { useState, useEffect, useCallback } from "react"
import type { ResearchSession } from "../lib/types.js"
import { getAllSessions, saveSession, deleteSession } from "../lib/db.js"

const STALE_THRESHOLD_MS = 15 * 60 * 1000

export function useResearchHistory() {
	const [list_sessions, setListSessions] = useState<ResearchSession[]>([])
	const [session_selected, setSessionSelected] = useState<ResearchSession | null>(null)
	const [is_sidebar_open, setIsSidebarOpen] = useState(false)
	const [is_loading, setIsLoading] = useState(true)

	// Load sessions on mount, mark stale in_progress as failed
	useEffect(() => {
		async function load() {
			const sessions = await getAllSessions()
			const now = Date.now()

			const updated = await Promise.all(
				sessions.map(async (s) => {
					if (s.status === "in_progress" && now - s.time_updated > STALE_THRESHOLD_MS) {
						const failed = { ...s, status: "failed" as const, time_updated: now }
						await saveSession(failed)
						return failed
					}
					return s
				})
			)

			setListSessions(updated)
			setIsLoading(false)
		}
		load()
	}, [])

	const selectSession = useCallback((session: ResearchSession) => {
		setSessionSelected(session)
		setIsSidebarOpen(false)
	}, [])

	const clearSelection = useCallback(() => {
		setSessionSelected(null)
	}, [])

	const persistSession = useCallback(async (session: ResearchSession) => {
		await saveSession(session)
		setListSessions(prev => {
			const exists = prev.some(s => s.id_session === session.id_session)
			if (exists) {
				return prev.map(s => s.id_session === session.id_session ? session : s)
			}
			return [session, ...prev]
		})
	}, [])

	const removeSession = useCallback(async (id_session: string) => {
		await deleteSession(id_session)
		setListSessions(prev => prev.filter(s => s.id_session !== id_session))
		setSessionSelected(prev => prev?.id_session === id_session ? null : prev)
	}, [])

	const toggleSidebar = useCallback(() => {
		setIsSidebarOpen(prev => !prev)
	}, [])

	return {
		list_sessions,
		session_selected,
		is_sidebar_open,
		is_loading,
		selectSession,
		clearSelection,
		persistSession,
		removeSession,
		toggleSidebar,
	}
}
