import React, { useEffect } from 'react'

import styles from './index.module.scss'
import testImg from '../../assets/images/test.png'
import testSVG from '../../assets/svgs/commentIcon.svg'

function App() {
	const str = '1234'

	useEffect(() => {
		console.log(str.includes('12'))

		0 ?? console.log(111)
		null ?? console.log(222)

		setTimeout(() => {
			const arr = document.querySelectorAll('img')
			Array.from(arr).forEach((img: HTMLImageElement) => {
				console.log(img?.src)
			})
		})
	}, [])

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
		</div>
	)
}

export default App
