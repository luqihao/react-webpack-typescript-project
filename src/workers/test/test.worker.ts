self.addEventListener('message', e => {
	self.postMessage({
		answer: 42
	})
	console.log('e.data', e.data)
})
