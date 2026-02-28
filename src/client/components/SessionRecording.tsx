import { useEffect, useRef, useState } from "react"

interface Props {
	steel_session_id: string
}

export function SessionRecording({ steel_session_id }: Props) {
	const ref_video = useRef<HTMLVideoElement>(null)
	const [error, setError] = useState<string | null>(null)
	const [is_loading, setIsLoading] = useState(true)

	useEffect(() => {
		const video = ref_video.current
		if (!video) return

		setError(null)
		setIsLoading(true)

		const manifest_url = `/api/sessions/${steel_session_id}/recording`
		let hls_instance: import("hls.js").default | null = null
		let retry_timer: ReturnType<typeof setTimeout> | null = null
		let attempts = 0
		const MAX_ATTEMPTS = 5
		const RETRY_DELAY_MS = 3000

		function tryLoad() {
			import("hls.js").then(({ default: Hls }) => {
				if (!video) return

				if (Hls.isSupported()) {
					const hls = new Hls({
						maxBufferLength: 30,
						maxMaxBufferLength: 60,
					})
					hls_instance = hls
					hls.loadSource(manifest_url)
					hls.attachMedia(video)

					hls.on(Hls.Events.MANIFEST_PARSED, () => {
						setIsLoading(false)
					})

					hls.on(Hls.Events.ERROR, (_event, data) => {
						if (data.fatal) {
							hls.destroy()
							hls_instance = null
							attempts++

							if (attempts < MAX_ATTEMPTS) {
								setError(null)
								retry_timer = setTimeout(tryLoad, RETRY_DELAY_MS)
							} else {
								setIsLoading(false)
								setError("Recording not available. It may still be processing.")
							}
						}
					})
				} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
					// Safari native HLS support
					video.src = manifest_url
					video.addEventListener("loadedmetadata", () => setIsLoading(false), { once: true })
					video.addEventListener("error", () => {
						setIsLoading(false)
						setError("Failed to load recording.")
					}, { once: true })
				} else {
					setIsLoading(false)
					setError("Your browser does not support HLS video playback.")
				}
			})
		}

		tryLoad()

		return () => {
			hls_instance?.destroy()
			if (retry_timer) clearTimeout(retry_timer)
		}
	}, [steel_session_id])

	if (error) {
		return (
			<div className="flex h-[400px] items-center justify-center rounded-2xl border border-steel-border bg-steel-surface">
				<p className="text-xs text-steel-body">{error}</p>
			</div>
		)
	}

	return (
		<div className="relative overflow-hidden rounded-2xl border border-steel-border bg-steel-surface">
			{is_loading && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-steel-surface">
					<div className="flex flex-col items-center gap-3">
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-steel-border border-t-steel-yellow" />
						<p className="text-xs tracking-tight text-steel-body">
							Loading recording...
						</p>
					</div>
				</div>
			)}
			<video
				ref={ref_video}
				controls
				playsInline
				className="h-[400px] w-full bg-black"
			/>
		</div>
	)
}
