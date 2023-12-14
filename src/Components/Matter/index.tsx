import React, { useEffect, useRef, useState } from 'react'
import { useInterval } from 'ahooks'

import styles from './index.module.scss'
import Plinko, { boxSize, borderWidth, launchContainerWidth, prizeList, prizeWidth } from './Plinko'
import prizeRecord from './ballPosRecord'
import { Button } from 'antd'

// 弹簧条数
const springLines = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
// 弹簧条宽度
const springLineWidth = 10
// 弹簧条高度
const springLineHeight = 1
// 弹簧帽高度
const springLineCapHeight = 2
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

const arr = [
	// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
	// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
	// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
]
const Matter = () => {
	const plinko = useRef<Plinko>(null)
	const increment = useRef<number>(1)

	const [isPress, setIsPress] = useState(false)
	const [angle, setAngle] = useState(springFlexMaxAngle)
	const [current, setCurrent] = useState(-1)

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
		if (!isPress || plinko.current.isRunning) {
			return
		}
		setAngle(springFlexMaxAngle)
		setIsPress(false)
		plinko.current.gameStart({
			record: current > -1 ? prizeRecord[current] : undefined,
			prize: current > -1 ? current + 1 : undefined
		})
	}

	useEffect(() => {
		plinko.current = new Plinko({ springHeight: getSpringHeight(springFlexMaxAngle) })
		plinko.current.init(document.getElementById('canvas') as HTMLCanvasElement, false)

		// arr.forEach((v, i) => {
		// 	v.forEach((_, ii) => {
		// 		console.log(-12 - ii * 0.1 - i)
		// 		const luck = new Plinko({
		// 			springHeight: getSpringHeight(springFlexMaxAngle),
		// 			calculateY: -13 - ii * 0.1 - i
		// 		})
		// 		luck.init(document.getElementById(`canvas${i.toString() + ii.toString()}`) as HTMLCanvasElement, false)
		// 	})
		// })
		return () => {
			clear?.()
		}
	}, [])

	return arr.length > 0 ? (
		<div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'flex-start' }}>
			{arr.map((v, i) => {
				return v.map((_, ii) => {
					return (
						<Item
							key={i.toString() + ii.toString()}
							id={`canvas${i.toString() + ii.toString()}`}
							angle={angle}
						/>
					)
				})
			})}
		</div>
	) : (
		<>
			<Item id={`canvas`} angle={angle} />
			<div className={styles['press-area']}>
				<div
					className={styles['text']}
					onMouseDown={() => {
						if (plinko.current.isRunning) {
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
			<div style={{ margin: '30px auto', textAlign: 'center' }}>
				固定结果：
				{prizeRecord.map((_, i) => {
					return (
						<Button
							key={i}
							type={current === i ? 'primary' : 'default'}
							onClick={() => setCurrent(current === i ? -1 : i)}
							style={{ marginLeft: 10 }}
						>
							奖品{i + 1}
						</Button>
					)
				})}
			</div>
		</>
	)
}

export default Matter

const Item = ({ id, angle }: { id: string; angle: number }) => {
	return (
		<div style={{ ...boxSize, margin: '50px auto', position: 'relative' }}>
			<canvas style={{ ...boxSize }} id={id} className={styles['canvas']}></canvas>
			<div
				style={{
					position: 'absolute',
					bottom: borderWidth * 2,
					left: 0,
					zIndex: -1,
					display: 'flex'
				}}
			>
				{prizeList.map((prize, index) => {
					return (
						<div
							key={index + prize}
							style={{
								marginLeft: borderWidth,
								textAlign: 'center',
								fontSize: 12,
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
	)
}
