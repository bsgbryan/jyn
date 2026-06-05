type Params = {
  message: {
    channel: string
  }
  session_id: string
}

export default ({
  message,
  session_id,
}: Params) => {
  postMessage({
    action: 'SUBSCRIBE',
		channel: message.channel,
		session_id,
	})
}
