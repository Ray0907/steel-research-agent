import { openDB, type IDBPDatabase } from "idb"
import type { ResearchSession } from "./types.js"

const DB_NAME = "steel_research"
const STORE_NAME = "research_sessions"
const DB_VERSION = 1

let db_promise: Promise<IDBPDatabase> | null = null

function getDb(): Promise<IDBPDatabase> {
	if (!db_promise) {
		db_promise = openDB(DB_NAME, DB_VERSION, {
			upgrade(db) {
				const store = db.createObjectStore(STORE_NAME, { keyPath: "id_session" })
				store.createIndex("time_created", "time_created")
			},
		})
	}
	return db_promise
}

export async function saveSession(session: ResearchSession): Promise<void> {
	const db = await getDb()
	await db.put(STORE_NAME, session)
}

export async function getAllSessions(): Promise<ResearchSession[]> {
	const db = await getDb()
	const all = await db.getAllFromIndex(STORE_NAME, "time_created")
	return all.reverse() as ResearchSession[]
}

export async function getSession(id_session: string): Promise<ResearchSession | undefined> {
	const db = await getDb()
	return db.get(STORE_NAME, id_session) as Promise<ResearchSession | undefined>
}

export async function deleteSession(id_session: string): Promise<void> {
	const db = await getDb()
	await db.delete(STORE_NAME, id_session)
}
