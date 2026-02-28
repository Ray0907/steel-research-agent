// TODO: recording video not rendering yet -- needs backend SSRF fix and HLS debugging
import { useEffect, useRef, useState } from "react"

interface Props {
	steel_session_id: string
}

export function SessionRecording({ steel_session_id }: Props) {
	const ref_video = useRef<HTMLVideoElement>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const video = ref_video.current
		if (!video) return

		const manifest_url = `/api/sessions/${steel_session_id}/recording`
		let hls_instance: import("hls.js").default | null = null

		import("hls.js").then(({ default: Hls }) => {
			if (!video) return

			if (Hls.isSupported()) {
				const hls = new Hls()
				hls_instance = hls
				hls.loadSource(manifest_url)
				hls.attachMedia(video)

				hls.on(Hls.Events.ERROR, (_event, data) => {
					if (data.fatal) {
						setError("Recording not available yet. It may take a moment to process.")
						hls.destroy()
					}
				})
			} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
				video.src = manifest_url
			} else {
				setError("Your browser does not support HLS video playback.")
			}
		})

		return () => { hls_instance?.destroy() }
	}, [steel_session_id])

	if (error) {
		return (
			<div className="flex h-[400px] items-center justify-center rounded-2xl border border-steel-border bg-steel-surface">
				<p className="text-xs text-steel-body">{error}</p>
			</div>
		)
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-steel-border bg-steel-surface">
			<video
				ref={ref_video}
				controls
				playsInline
				className="h-[400px] w-full bg-black"
			/>
		</div>
	)
}
