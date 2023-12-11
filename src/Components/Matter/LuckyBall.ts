import { Engine, Render, Events, Bodies, Body, Composite, Runner, Bounds, Vertices } from 'matter-js'
// 容器宽高
export const boxSize = {
	width: 500,
	height: 600
}
// 边界尺寸
export const borderWidth = 5
// 小球半径
const ballRadius = 12
// 障碍物圆柱半径
const obstacleRadius = 10
// 障碍物圆柱渲染多少层
const obstacleHorNum = 7
// 障碍物圆柱渲染多少列
const obstacleColNum = 7
// 右侧发射通道宽度
export const launchContainerWidth = 50
// 奖品列表
export const prizeList = ['谢谢|惠顾', '100|积分', '谢谢|惠顾', '200|积分', '500|积分', '1000|积分', '100|积分']
// 奖品数量
export const prizeNum = prizeList.length
// 奖品占宽
export const prizeWidth = (boxSize.width - (3 + (prizeNum - 1)) * borderWidth - launchContainerWidth) / prizeNum
// 奖品边界高度
const prizeHeight = 75

interface LuckyBallOption {
	springHeight: number
}

class LuckyBall {
	private composite: Composite = null
	private ball: Body = null
	private engine: Engine = null
	private render: Render = null
	private runner: Runner = null
	public isRunning = false
	public springHeight = 0

	constructor(options: LuckyBallOption) {
		this.springHeight = options.springHeight || 0
	}

	listenCollisionEnd = (event: any) => {
		const pairs = event.pairs
		for (let i = 0; i < pairs.length; i++) {
			const pair = pairs[i]
			if (
				['ball', '奖品'].some(v => pair.bodyA.label.includes(v)) &&
				['ball', '奖品'].some(v => pair.bodyB.label.includes(v))
			) {
				console.log(`小球与奖品${pair.bodyA.label === 'ball' ? pair.bodyB.label : pair.bodyA.label}碰撞`)
				this.reset()
			}
		}
	}

	// 开始游戏
	gameStart = () => {
		if (this.isRunning) {
			return
		}
		Body.setStatic(this.ball, false)
		Body.setVelocity(this.ball, { x: 0, y: -30 })
		this.isRunning = true
	}

	// 重置游戏
	reset = () => {
		console.log('重置游戏')
		Events.off(this.engine, 'collisionEnd', this.listenCollisionEnd)
		Render.stop(this.render)
		Runner.stop(this.runner)
		Engine.clear(this.engine)
		Composite.clear(this.composite, true)
		this.ball = null
		this.engine = null
		this.render = null
		this.runner = null
		setTimeout(() => {
			this.init()
		}, 1000)
	}

	// 初始化游戏
	init = () => {
		this.isRunning = false
		this.ball = this.renderBall()
		this.engine = Engine.create()

		// 创建渲染器，并将引擎连接到画布上
		this.render = Render.create({
			canvas: document.getElementById('canvas') as HTMLCanvasElement,
			engine: this.engine, // 绑定引擎
			options: {
				wireframes: false,
				background: null,
				...boxSize
			},
			bounds: Bounds.create([
				{ x: ballRadius + borderWidth, y: ballRadius + borderWidth },
				{ x: boxSize.width - ballRadius - borderWidth, y: boxSize.height - ballRadius - borderWidth }
			])
		})

		// 将所有物体添加到世界中
		this.composite = Composite.add(this.engine.world, [
			this.ball,
			this.renderSpringCap(),
			...this.renderBound(),
			...this.renderPrizeDivider(),
			...this.renderPrize(),
			...this.renderObstacle()
		])

		// 执行渲染操作
		Render.run(this.render)

		// 创建运行方法
		this.runner = Runner.create()
		Render.lookAt(this.render, {
			min: { x: 0, y: 0 },
			max: { x: boxSize.width, y: boxSize.height }
		})

		// 运行渲染器
		Runner.run(this.runner, this.engine)
	}

	// 初始化小球
	renderBall = () => {
		const ball = Bodies.circle(
			boxSize.width - borderWidth - launchContainerWidth / 2,
			boxSize.height - ballRadius - borderWidth - Math.abs(this.springHeight) - borderWidth,
			ballRadius,
			{
				label: 'ball',
				isStatic: true,
				restitution: 0.5,
				mass: 20,
				render: {
					fillStyle: 'pink'
				}
			}
		)
		return ball
	}

	// 初始化小球初始位置下的挡板
	renderSpringCap = () => {
		const cap = Bodies.rectangle(
			boxSize.width - borderWidth - launchContainerWidth / 2,
			boxSize.height - borderWidth - Math.abs(this.springHeight) - borderWidth / 2,
			launchContainerWidth,
			borderWidth,
			{
				isStatic: true,
				render: {
					fillStyle: 'red'
				}
			}
		)
		return cap
	}

	// 初始化边界
	renderBound = () => {
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

	// 初始化奖品间隔挡板
	renderPrizeDivider = () => {
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

	// 初始化小球圆柱障碍物
	renderObstacle = () => {
		const obstacle = []
		const marginX = (boxSize.width - launchContainerWidth) / (obstacleColNum + 1)
		const marginY = (boxSize.height - prizeHeight) / (obstacleHorNum + 1)
		let x = 0,
			y = 0
		for (let i = 0; i < obstacleHorNum; i++) {
			x = i % 2 === 0 ? -marginX / 3 + obstacleRadius : obstacleRadius
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

	// 初始化奖品底板
	renderPrize = () => {
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

			Events.on(this.engine, 'collisionEnd', this.listenCollisionEnd)
			prizeGround.push(prize)
			x += margin + borderWidth
		}
		return prizeGround
	}
}

export default LuckyBall
