import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Engine, Render, Events, Bodies, Body, Composite, Runner, Bounds, Vertices } from 'matter-js'

import styles from './index.module.scss'
import { useInterval } from 'ahooks'

// 容器宽高
const boxSize = {
	width: 500,
	height: 600
}
// 边界尺寸
const borderWidth = 5
// 小球半径
const ballRadius = 12
// 障碍物圆柱半径
const obstacleRadius = 10
// 障碍物圆柱渲染多少层
const obstacleHorNum = 7
// 障碍物圆柱渲染多少列
const obstacleColNum = 7
// 右侧发射通道宽度
const launchContainerWidth = 50
// 奖品列表
const prizeList = ['谢谢|惠顾', '100|积分', '谢谢|惠顾', '200|积分', '500|积分', '1000|积分', '100|积分']
// 奖品数量
const prizeNum = prizeList.length
// 奖品占宽
const prizeWidth = (boxSize.width - (3 + (prizeNum - 1)) * borderWidth - launchContainerWidth) / prizeNum
// 奖品边界高度
const prizeHeight = 75
// 弹簧条数
const springLines = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
// 弹簧条宽度
const springLineWidth = 30
// 弹簧条高度
const springLineHeight = 3
// 弹簧帽高度
const springLineCapHeight = 5
// 弹簧最大和最小角度
const springMaxAngle = 15

// 已知斜边长和角度求直角边长
function getSideLength(len, angle) {
	const radian = ((2 * Math.PI) / 360) * Math.abs(angle)
	return Math.sin(radian) * len
}

const Matter = () => {
	const increment = useRef(1)
	const [angle, setAngle] = useState(-springMaxAngle)

	const getSpringHeight = () => {
		const height =
			2 * springLineCapHeight +
			springLines
				.map(v => (v === 1 ? springLineHeight : getSideLength(springLineWidth, angle)))
				.reduce((a, b) => a + b)
		return height
	}

	const renderObstacle = () => {
		const obstacle = []
		const marginX = (boxSize.width - launchContainerWidth) / (obstacleColNum + 1)
		const marginY = (boxSize.height - prizeHeight) / (obstacleHorNum + 1)
		let x = 0,
			y = 0
		for (let i = 0; i < obstacleHorNum; i++) {
			x = i % 2 === 0 ? -marginX / 2 + obstacleRadius : obstacleRadius
			y += marginY
			for (let j = 0; j < obstacleColNum; j++) {
				x += marginX
				obstacle.push(
					Bodies.circle(x, y, obstacleRadius, {
						isStatic: true
					})
				)
			}
		}
		return obstacle
	}

	const renderPrizeDivider = () => {
		const divider = []
		const margin = prizeWidth
		let x = borderWidth + margin + borderWidth / 2
		while (x < boxSize.width - launchContainerWidth - borderWidth * 3) {
			divider.push(
				Bodies.rectangle(x, boxSize.height - prizeHeight / 2, borderWidth, prizeHeight, {
					isStatic: true,
					render: {
						fillStyle: 'red'
					}
				})
			)
			x += margin + borderWidth
		}
		return divider
	}

	const renderPrize = engine => {
		const prizeGround = []
		const margin = prizeWidth
		let x = borderWidth + margin / 2
		while (x < boxSize.width - launchContainerWidth - borderWidth * 3) {
			const prize = Bodies.rectangle(x, boxSize.height - borderWidth / 2, margin, borderWidth, {
				isStatic: true,
				label: `奖品${prizeGround.length + 1}`,
				render: {
					fillStyle: 'lightblue'
				}
			})
			const cb = (event: any) => {
				const pairs = event.pairs
				for (let i = 0; i < pairs.length; i++) {
					const pair = pairs[i]
					if (
						['ball', '奖品'].some(v => pair.bodyA.label.includes(v)) &&
						['ball', '奖品'].some(v => pair.bodyB.label.includes(v))
					) {
						console.log(
							`小球与奖品${pair.bodyA.label === 'ball' ? pair.bodyB.label : pair.bodyA.label}碰撞`
						)
					}
				}
			}
			Events.on(engine, 'collisionEnd', cb)
			prizeGround.push(prize)
			x += margin + borderWidth
		}
		return prizeGround
	}

	const renderBall = () => {
		const ball = Bodies.circle(
			boxSize.width - borderWidth - launchContainerWidth / 2,
			boxSize.height - ballRadius - borderWidth - getSpringHeight(),
			ballRadius,
			{
				label: 'ball',
				isStatic: true,
				restitution: 0.5,
				mass: 50,
				render: {
					fillStyle: 'pink'
				}
			}
		)

		// Events.on(engine, 'afterUpdate', function () {
		// if (ball.position.x < render.bounds.min.x) {
		// 	ball.position.x = render.bounds.min.x
		// }
		// if (ball.position.x > render.bounds.max.x) {
		// 	ball.position.x = render.bounds.max.x
		// }
		// if (ball.position.y < render.bounds.min.y) {
		// 	ball.position.y = render.bounds.min.y
		// }
		// if (ball.position.y > render.bounds.max.y) {
		// 	ball.position.y = render.bounds.max.y
		// }
		// })

		// setTimeout(() => {
		// 	Body.setStatic(ball, false)
		// 	Body.setVelocity(ball, { x: 0, y: -50 }) // 小球弹出
		// }, 1000)
		return ball
	}

	const ball = useRef(renderBall())

	const renderBound = () => {
		const boundTop = Bodies.rectangle(boxSize.width / 2, borderWidth / 2, boxSize.width, borderWidth, {
			isStatic: true,
			render: {
				fillStyle: 'red'
			}
		})
		const boundBottom = Bodies.rectangle(
			boxSize.width / 2,
			boxSize.height - borderWidth / 2,
			boxSize.width,
			borderWidth,
			{
				isStatic: true,
				render: {
					fillStyle: 'red'
				}
			}
		)
		const boundLeft = Bodies.rectangle(borderWidth / 2, boxSize.height / 2, borderWidth, boxSize.height, {
			isStatic: true,
			render: {
				fillStyle: 'green'
			}
		})
		const boundRight = Bodies.rectangle(
			boxSize.width - borderWidth / 2,
			boxSize.height / 2,
			borderWidth,
			boxSize.height,
			{
				isStatic: true,
				render: {
					fillStyle: 'blue'
				}
			}
		)
		const boundLaunch = Bodies.rectangle(
			boxSize.width - borderWidth - launchContainerWidth - borderWidth / 2,
			(boxSize.height - launchContainerWidth) / 2 + launchContainerWidth,
			borderWidth,
			boxSize.height - launchContainerWidth,
			{
				isStatic: true,
				render: {
					fillStyle: 'purple'
				}
			}
		)
		const dangban = Bodies.fromVertices(
			boxSize.width - 22,
			22,
			[
				Vertices.create(
					[
						{ x: 0, y: 0 },
						{ x: 50, y: 0 },
						{ x: 50, y: 50 }
					],
					boundTop
				)
			],
			{
				isStatic: true,
				render: {
					fillStyle: 'orange'
				}
			}
		)
		return [boundTop, boundBottom, boundLeft, boundRight, boundLaunch, dangban]
	}

	const init = () => {
		const engine = Engine.create()

		// 创建渲染器，并将引擎连接到画布上
		const render = Render.create({
			element: document.getElementById('matter'), // 绑定页面元素
			engine: engine, // 绑定引擎
			options: {
				wireframes: false,
				background: null,
				...boxSize,
				hasBounds: true
			},
			bounds: Bounds.create([
				{ x: ballRadius + borderWidth, y: ballRadius + borderWidth },
				{ x: boxSize.width - ballRadius - borderWidth, y: boxSize.height - ballRadius - borderWidth }
			])
		})
		// 将所有物体添加到世界中
		Composite.add(engine.world, [
			ball.current,
			...renderBound(),
			...renderPrizeDivider(),
			...renderPrize(engine),
			...renderObstacle()
		])

		// 执行渲染操作
		Render.run(render)

		// const renderPrizeText = () => {
		// 	const ctx = render.context
		// 	const margin = prizeWidth
		// 	let x = borderWidth + margin / 2
		// 	let index = 0
		// 	while (x < boxSize.width - launchContainerWidth - borderWidth * 3) {
		// 		const textList = prizeList[index].split('|')
		// 		let y = 560
		// 		textList.forEach(text => {
		// 			ctx.font = '20px Arial'
		// 			ctx.fillStyle = '#000'
		// 			ctx.textAlign = 'center'
		// 			ctx.fillText(text, x, y)
		// 			y += 24
		// 		})
		// 		x += margin + borderWidth
		// 		++index
		// 	}
		// 	Events.off(render, 'afterRender', renderPrizeText)
		// }
		// Events.on(render, 'afterRender', renderPrizeText)

		// 创建运行方法
		const runner = Runner.create()
		Render.lookAt(render, {
			min: { x: 0, y: 0 },
			max: { x: boxSize.width, y: boxSize.height }
		})

		// 运行渲染器
		Runner.run(runner, engine)
	}

	useEffect(() => {
		init()
		return () => {
			clear?.()
		}
	}, [])

	const [isPress, setIsPress] = useState(false)
	const clear = useInterval(
		() => {
			if (angle > -1) {
				increment.current = -1
			} else if (angle < -springMaxAngle - 1) {
				increment.current = 1
			}
			const a = angle + increment.current
			setAngle(a)
		},
		isPress ? 25 : undefined
	)

	useEffect(() => {
		const x = boxSize.width - borderWidth - launchContainerWidth / 2
		const y = boxSize.height - ballRadius - borderWidth - getSpringHeight()
		Body.setPosition(ball.current, {
			x,
			y
		})
	}, [angle])

	const gameStart = useCallback(() => {
		setAngle(-springMaxAngle)
		setIsPress(false)
		Body.setStatic(ball.current, false)
		Body.setVelocity(ball.current, { x: 0, y: -30 })
	}, [])

	return (
		<>
			<div id="matter" style={{ ...boxSize, margin: '50px auto', position: 'relative' }}>
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
									height: springLineHeight,
									transformOrigin: 'left',
									transform: `rotateZ(5deg)`
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
						setIsPress(true)
					}}
					onMouseUp={gameStart}
					onMouseLeave={gameStart}
				>
					长按松开释放小球
				</div>
				<div
					className={styles['press-bg']}
					style={{ width: `${(springMaxAngle - Math.abs(angle)) * (1 / springMaxAngle) * 100}%` }}
				></div>
			</div>
		</>
	)
}

export default Matter
