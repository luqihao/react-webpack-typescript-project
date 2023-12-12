export function wait(time = 0): Promise<any> {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(null)
		}, time)
	})
}
