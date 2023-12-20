import speed1 from './-13.101.json'
import speed2 from './-13.201.json'
import speed3 from './-13.301.json'
import speed4 from './-13.401.json'
import speed5 from './-13.501.json'
import speed6 from './-13.601.json'
import speed7 from './-13.701.json'
import speed8 from './-13.801.json'
import speed9 from './-13.901.json'
import speed10 from './-14.001.json'
import speed11 from './-14.101.json'
import speed12 from './-14.201.json'
import speed13 from './-14.301.json'
import speed14 from './-14.401.json'
import speed15 from './-14.501.json'
import speed16 from './-14.601.json'
import speed17 from './-14.701.json'
import speed18 from './-14.801.json'
import speed19 from './-14.901.json'
import speed20 from './-15.001.json'

const speed = {
	...speed1,
	...speed2,
	...speed3,
	...speed4,
	...speed5,
	...speed6,
	...speed7,
	...speed8,
	...speed9,
	...speed10,
	...speed11,
	...speed12,
	...speed13,
	...speed14,
	...speed15,
	...speed16,
	...speed17,
	...speed18,
	...speed19,
	...speed20
}

const prizeSpeed = {
	奖品1: [],
	奖品2: [],
	奖品3: [],
	奖品4: [],
	奖品5: [],
	奖品6: [],
	奖品7: []
}

for (const key in speed) {
	if (speed[key].length === 1 && speed[key][0].includes('奖品')) {
		prizeSpeed[speed[key][0]].push(Number(key))
		prizeSpeed[speed[key][0]] = prizeSpeed[speed[key][0]].sort()
	}
}
console.log('origin prizeSpeed', { ...prizeSpeed })
for (const key in prizeSpeed) {
	const average = 100
	const list: string[] = prizeSpeed[key]
	const rest = list.length % average
	const every = Math.floor(list.length / average)
	const newList = []
	for (let i = 0; i < average; i++) {
		let j = 0
		newList[i] = []
		while (j < every + (average - 1 - i < rest ? 1 : 0)) {
			newList[i].push(list.shift())
			j++
		}
	}
	prizeSpeed[key] = newList
}
export default prizeSpeed
