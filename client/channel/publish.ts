type Params = {
  message: {
    channel: string
    content: string
  }
  session_id: string
}

export default ({
  message,
  session_id,
}: Params) => {
  postMessage({
    action: 'PUBLISH',
    channel: message.channel,
		content: message.content,
		session_id,
	})
}
