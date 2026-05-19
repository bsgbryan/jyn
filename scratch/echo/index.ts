type Params = {
  message: string
  session_id: string
}

export default ({
  message,
  session_id,
}: Params) => {
  postMessage({
		content: `Echoing: ${message}`,
		session_id,
		type: 'TEXT',
	})
}
