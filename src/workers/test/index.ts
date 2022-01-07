import testWorker from '@workers/test/test.worker.ts'

const testWor = () => {
	console.log('in worker')
	const worker = new testWorker()
	console.log('worker url', worker)
	worker.postMessage({
		question:
			'The Answer to the Ultimate Question of Life, The Universe, and Everything.',
	})
	worker.onmessage = ({ data: { answer } }) => {
		console.log(answer)
	}
	worker.onerror = e => {
		console.log('丢你')
	}
}

export default testWor
