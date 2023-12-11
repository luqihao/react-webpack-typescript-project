import React, { useEffect, useRef, useState } from 'react'
import { useInterval } from 'ahooks'

import styles from './index.module.scss'
import LuckyBall, { boxSize, borderWidth, launchContainerWidth, prizeList, prizeWidth } from './LuckyBall'

// 弹簧条数
const springLines = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
// 弹簧条宽度
const springLineWidth = 30
// 弹簧条高度
const springLineHeight = 3
// 弹簧帽高度
const springLineCapHeight = 5
// 弹簧可伸缩最大角度
const springFlexMaxAngle = -15
// 弹簧固定角度
const springRegularAngle = 5

// 已知斜边长和角度求直角边长
function getSideLength(len, angle) {
	const radian = ((2 * Math.PI) / 360) * Math.abs(angle)
	return Math.sin(radian) * len
}

// 根据角度算出弹簧高度
const getSpringHeight = (angle: number) => {
	const height =
		2 * springLineCapHeight +
		springLines
			.map(v =>
				v === 1 ? getSideLength(springLineWidth, springRegularAngle) : getSideLength(springLineWidth, angle)
			)
			.reduce((a, b) => a + b)
	return height
}

const Matter = () => {
	const luckyBall = useRef(new LuckyBall({ springHeight: getSpringHeight(springFlexMaxAngle) }))
	const increment = useRef(1)

	const [isPress, setIsPress] = useState(false)
	const [angle, setAngle] = useState(springFlexMaxAngle)

	const clear = useInterval(
		() => {
			const a = angle + increment.current
			if (a > -1) {
				increment.current = -1
			} else if (a < springFlexMaxAngle) {
				increment.current = 1
			}
			if (a >= springFlexMaxAngle) {
				setAngle(a)
			}
		},
		isPress ? 25 : undefined
	)
	const gameStart = () => {
		if (!isPress || luckyBall.current.isRunning) {
			return
		}
		setAngle(springFlexMaxAngle)
		setIsPress(false)
		luckyBall.current.gameStart()
	}

	useEffect(() => {
		luckyBall.current.init()
		return () => {
			clear?.()
		}
	}, [])

	return (
		<>
			<div style={{ ...boxSize, margin: '50px auto', position: 'relative' }}>
				<canvas style={{ ...boxSize }} id="canvas" className={styles['canvas']}></canvas>
				<div style={{ position: 'absolute', bottom: borderWidth * 2, left: 0, zIndex: -1, display: 'flex' }}>
					{prizeList.map((prize, index) => {
						return (
							<div
								key={index + prize}
								style={{
									marginLeft: borderWidth,
									textAlign: 'center',
									fontSize: 20,
									width: prizeWidth
								}}
							>
								{prize.split('|').map(text => {
									return <div key={text}>{text}</div>
								})}
							</div>
						)
					})}
				</div>
				{/* 弹簧用css画吧 */}
				<div
					className={styles['spring']}
					style={{ width: launchContainerWidth, right: borderWidth, bottom: borderWidth }}
				>
					<div className={styles['cap']} style={{ height: springLineCapHeight }}></div>
					{springLines.map((v, i) => {
						return v === 1 ? (
							<div
								key={i}
								className={styles['stand']}
								style={{
									width: springLineWidth,
									height: getSideLength(springLineWidth, springRegularAngle),
									transformOrigin: 'left',
									transform: `rotateZ(${springRegularAngle}deg)`
								}}
							></div>
						) : (
							<div key={i} style={{ height: getSideLength(springLineWidth, angle) }}>
								<div
									className={styles['stand']}
									style={{
										width: springLineWidth,
										height: springLineHeight,
										transformOrigin: 'right',
										transform: `rotateZ(${angle}deg)`
									}}
								></div>
							</div>
						)
					})}
					<div className={styles['cap']} style={{ height: springLineCapHeight }}></div>
				</div>
			</div>
			<div className={styles['press-area']}>
				<div
					className={styles['text']}
					onMouseDown={() => {
						if (luckyBall.current.isRunning) {
							return
						}
						setIsPress(true)
					}}
					onMouseUp={gameStart}
					onMouseLeave={gameStart}
				>
					长按松开释放小球
				</div>
				<div
					className={styles['press-bg']}
					style={{
						width: `${
							(Math.abs(springFlexMaxAngle) - Math.abs(angle)) * (1 / Math.abs(springFlexMaxAngle)) * 100
						}%`
					}}
				></div>
			</div>
		</>
	)
}

export default Matter
