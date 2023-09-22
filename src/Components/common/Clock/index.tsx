import React, { useEffect, useRef, useState } from 'react'
import classnames from 'classnames'

import styles from './index.module.scss'

const width = 300
const height = 300
const radius = width / 2
const kedu = []
for (let i = 0; i < 60; i++) {
	kedu.push(i)
}

const hour = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

const Clock = () => {
	const [secDeg, setSecDeg] = useState(0)
	const [minDeg, setMinDeg] = useState(0)
	const [hourDeg, setHourDeg] = useState(0)

	const calculate = () => {
		const now = new Date()
		const hour = now.getHours()
		const min = now.getMinutes()
		const sec = now.getSeconds()
		const secAngle = sec * (360 / 60) - 90
		const minAngle = min * (360 / 60) - 90
		const hourAngle = Math.round(hour - 12) * (360 / 12) - 90
		setSecDeg(secAngle)
		setMinDeg(minAngle)
		setHourDeg(hourAngle)
	}

	const timer = useRef(setInterval(() => calculate(), 1000))

	useEffect(() => {
		calculate()
		return () => {
			clearInterval(timer.current)
		}
	}, [])

	return (
		<div className={styles['clock']} style={{ width, height }}>
			{kedu.map(i => {
				const w = i % 5 === 0 ? 20 : 10
				const h = i % 5 === 0 ? 3 : 1
				const deg = i * (360 / 60) - 90
				const x = radius - w
				return (
					<div
						key={i}
						className={styles['kedu']}
						data-kedu={i}
						data-deg={deg}
						style={{ width: w, height: h, transform: `rotate(${deg}deg) translate(${x}px, -50%)` }}
					/>
				)
			})}
			{hour.map(i => {
				const deg = ((i - 3) / 6) * Math.PI
				const r = radius
				const l = r + (r - 30) * Math.cos(deg)
				const t = r + (r - 30) * Math.sin(deg) - 1

				return (
					<div key={i} className={styles['hour-num']} style={{ left: l, top: t }}>
						{i}
					</div>
				)
			})}
			<div className={styles['center']}></div>
			<div
				className={classnames(styles['line'], styles['hour'])}
				style={{ transform: `translateY(-50%) rotate(${hourDeg}deg)` }}
			></div>
			<div
				className={classnames(styles['line'], styles['min'])}
				style={{ transform: `translateY(-50%) rotate(${minDeg}deg)` }}
			></div>
			<div
				className={classnames(styles['line'], styles['sec'])}
				style={{ transform: `translateY(-50%) rotate(${secDeg}deg)` }}
			></div>
		</div>
	)
}

export default Clock
