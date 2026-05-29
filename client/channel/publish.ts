type Params = {
  message: string
  session_id: string
}

export default ({
  message,
  session_id,
}: Params) => {
  const json = JSON.parse(message)
  postMessage({
    action: 'PUBLISH',
    channel: json.channel,
		content: json.content,
		session_id,
	})
}
