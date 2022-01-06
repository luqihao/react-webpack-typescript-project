import { makeAutoObservable } from 'mobx'

class GlobalStore {
	constructor() {
		makeAutoObservable(this)
	}

	temp: IGlobalStore.Temp = {
		a: 1,
		b: 2,
	}

	changeTemp = () => {
		this.temp.a = 3
		// this.temp = { a: 3, b: 4 }
	}

	list: IGlobalStore.Temp[] = [
		{
			a: 1,
			b: 2,
		},
		{
			a: 3,
			b: 4,
		},
		{
			a: 5,
			b: 6,
		},
	]

	changeList = () => {
		this.list[2].b = 10
		// this.list[2] = {
		// 	a: 5,
		// 	b: 10,
		// }
	}

	count = 1

	addCount = () => {
		this.count += 1
	}

	get doubleCount() {
		return this.count * 3
	}
}

export default new GlobalStore()
