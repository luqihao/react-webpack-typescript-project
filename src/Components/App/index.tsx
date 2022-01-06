import React, { useEffect } from 'react'
import { observer, useLocalObservable } from 'mobx-react'
import { Link } from 'react-router-dom'

import styles from './index.module.scss'
import testImg from '@assets/images/test.png'
import testSVG from '@assets/svgs/commentIcon.svg'
import { useRootStore } from '@utils/customHooks'
import { getPlusRes } from '@utils/math'

const App = () => {
	const { globalStore } = useRootStore()
	const { temp, count, addCount, doubleCount, changeTemp, list, changeList } =
		globalStore

	const str = '1234'

	useEffect(() => {
		console.log(str.includes('12'))
		console.log(() => 1)
		0 ?? console.log(111)
		null ?? console.log(222)
		setTimeout(() => {
			const arr = document.querySelectorAll('img')
			Array.from(arr).forEach((img: HTMLImageElement) => {
				console.log(img?.src)
			})
		})
		console.log('temp', temp)
		console.log('app getPlusRes', getPlusRes(1, 2))
	}, [])

	const counter = useLocalObservable(() => ({
		number: 0,
		addNumber() {
			this.number++
		},
		downNumber() {
			this.number--
		},
	}))

	return (
		<div className={styles.app}>
			App
			<img src={testImg} />
			<img src={testSVG} />
			<div className={styles.img} />
			<div className={styles.svg} />
			<div className={styles.text}>
				方法铯打开肌肤浑善达克减肥黑科技大厦可减肥好看撒的结合副科级铯的看法款式大方看哈电视就很烦
			</div>
			<Link to="/page1">go to page1</Link>
			<div>{counter.number}</div>
			<button onClick={counter.addNumber}>+++++</button>
			<button onClick={counter.downNumber}>-----</button>
			<div>count: {count}</div>
			<div>doubleCount: {doubleCount}</div>
			<button onClick={addCount}>addCount</button>
			<div>temp.a: {temp.a}</div>
			<button onClick={changeTemp}>change temp</button>
			<div>{list.map((v: IGlobalStore.Temp) => v.b).join(',')}</div>
			<button onClick={changeList}>change list</button>
		</div>
	)
}

export default observer(App)
