import BigNumber from 'bignumber.js'
import { Engine, Render, Events, Bodies, Body, Composite, Runner, Bounds, Common } from 'matter-js'

// 容器宽高
export const boxSize = {
	width: 200,
	height: 200
}
// 边界尺寸
export const borderWidth = 1
// 小球半径
const ballRadius = 6
// 障碍物圆柱半径
const obstacleRadius = 6
// 障碍物圆柱渲染多少层
const obstacleHorNum = 4
// 障碍物圆柱渲染多少列
const obstacleColNum = 5
// 右侧发射通道宽度
export const launchContainerWidth = 20
// 奖品列表
export const prizeList = ['谢谢|惠顾', '100|积分', '谢谢|惠顾', '200|积分', '500|积分', '1000|积分', '100|积分']
// 奖品数量
export const prizeNum = prizeList.length
// 奖品占宽
export const prizeWidth = (boxSize.width - (3 + (prizeNum - 1)) * borderWidth - launchContainerWidth) / prizeNum
// 奖品边界高度
const prizeHeight = 35

interface LuckyBallOption {
	springHeight: number
	calculateY?: number
}

const loopTime = 3
class LuckyBall {
	private composite: Composite = null
	private ball: Body = null
	private engine: Engine = null
	private render: Render = null
	private runner: Runner = null
	public isRunning = false
	public springHeight = 0
	public calculatingLaunchSpeedResult = {}
	public bounds: Bounds = Bounds.create([
		{ x: ballRadius + borderWidth, y: ballRadius + borderWidth },
		{ x: boxSize.width - ballRadius - borderWidth, y: boxSize.height - ballRadius - borderWidth }
	])

	canvas = null

	// 用于自动化计算
	calculateY: BigNumber = new BigNumber(0)
	increment: BigNumber = new BigNumber(-0.001)
	max: BigNumber = this.calculateY.plus(1)
	autoCalculate = false
	loopNum = loopTime

	constructor(options: LuckyBallOption) {
		this.springHeight = options.springHeight || 0
		if (!!Math.abs(options?.calculateY)) {
			this.calculateY = new BigNumber(options.calculateY)
			this.max = this.calculateY.plus(new BigNumber(-0.1))
		}
	}

	// 自动推算在各种初始速度的情况对应的奖品结果
	calculatingLaunchSpeed = async () => {
		this.autoCalculate = true
		if (this.calculateY.isGreaterThanOrEqualTo(this.max)) {
			this.gameStart(this.calculateY.toNumber())
		} else {
			console.log('this.calculatingLaunchSpeedResult', this.calculatingLaunchSpeedResult)
			const obj = {}
			for (const key in this.calculatingLaunchSpeedResult) {
				obj[key] = Array.from(this.calculatingLaunchSpeedResult[key])
			}
			const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
			const link = document.createElement('a')
			link.href = URL.createObjectURL(blob)
			link.download = `${this.calculateY.toNumber()}.${navigator.vendor}.json`
			link.click()

			this.calculateY = new BigNumber(0)
			this.increment = new BigNumber(-0.001)
			this.max = this.calculateY.plus(1)
			this.autoCalculate = false
			this.calculatingLaunchSpeedResult = {}
			return
		}
	}

	continueCalculate = () => {
		if (this.autoCalculate) {
			if (this.loopNum > 0) {
				this.loopNum -= 1
			} else {
				this.loopNum = loopTime
				this.calculateY = this.calculateY.plus(this.increment)
			}
		}
	}

	setCalculateResult = (value: string) => {
		if (this.calculatingLaunchSpeedResult[this.calculateY.toString()] instanceof Set) {
			this.calculatingLaunchSpeedResult[this.calculateY.toString()].add(value)
		} else {
			const newSet = new Set()
			newSet.add(value)
			this.calculatingLaunchSpeedResult[this.calculateY.toString()] = newSet
		}
	}

	handleGameEnd = (event: any) => {
		const pairs = event.pairs
		for (let i = 0; i < pairs.length; i++) {
			const pair = pairs[i]
			if (
				['ball', '奖品'].some(v => pair.bodyA.label.includes(v)) &&
				['ball', '奖品'].some(v => pair.bodyB.label.includes(v))
			) {
				const value = pair.bodyA.label === 'ball' ? pair.bodyB.label : pair.bodyA.label
				this.setCalculateResult(value)
				this.continueCalculate()
				console.log(`小球与${value}碰撞`)
				this.reset()
			} else if (
				['ball', 'springCap'].some(v => pair.bodyA.label.includes(v)) &&
				['ball', 'springCap'].some(v => pair.bodyB.label.includes(v))
			) {
				this.setCalculateResult(`游戏失败，此时速度为${this.calculateY}`)
				this.continueCalculate()
				console.log(`游戏失败，此时速度为${this.calculateY}`)
				this.reset()
			}
		}
	}

	handleBallOverBound = () => {
		// 获取小球位置
		const ballPosition = this.ball.position

		// 判断小球是否超出范围
		if (!Bounds.contains(this.bounds, ballPosition)) {
			// 将小球速度取反
			this.ball.velocity.x *= -1
			this.ball.velocity.y *= -1

			// 重新设置小球位置
			Body.setPosition(this.ball, {
				x: Common.clamp(ballPosition.x, this.bounds.min.x, this.bounds.max.x),
				y: Common.clamp(ballPosition.y, this.bounds.min.y, this.bounds.max.y)
			})
		}
	}

	// 开始游戏
	gameStart = async (y = -13) => {
		if (this.isRunning) {
			return
		}
		Events.on(this.engine, 'collisionStart', this.handleGameEnd)
		Events.on(this.engine, 'beforeUpdate', this.handleBallOverBound)
		Body.setStatic(this.ball, false)
		Body.setVelocity(this.ball, { x: 0, y })
		this.isRunning = true
	}

	// 重置游戏
	reset = () => {
		console.log('重置游戏')
		Events.off(this.engine, 'collisionStart', this.handleGameEnd)
		Events.off(this.engine, 'beforeUpdate', this.handleBallOverBound)
		Events.off(this.render, 'afterRender', this.renderSpeed)
		Render.stop(this.render)
		Runner.stop(this.runner)
		Engine.clear(this.engine)
		Composite.clear(this.composite, true)
		this.ball = null
		this.engine = null
		this.render = null
		this.runner = null
		this.isRunning = false
		setTimeout(() => {
			this.init(this.canvas, this.autoCalculate)
		}, 50)
	}

	renderSpeed = () => {
		const ctx = (this.render as Render).context
		// 设置文字样式
		ctx.font = '14px Arial'
		ctx.fillStyle = '#000'
		ctx.fillText('本次初速度：' + this.calculateY.toString(), 5, 17)
	}

	// 初始化游戏
	init = (canvas: HTMLCanvasElement, autoRun = false) => {
		this.canvas = canvas
		this.isRunning = false
		this.ball = this.renderBall()
		this.engine = Engine.create()

		// 创建渲染器，并将引擎连接到画布上
		this.render = Render.create({
			canvas,
			engine: this.engine, // 绑定引擎
			options: {
				wireframes: false,
				background: null,
				...boxSize
			},
			bounds: this.bounds
		})

		Events.on(this.render, 'afterRender', this.renderSpeed)

		// 将所有物体添加到世界中
		this.composite = Composite.add(this.engine.world, [
			this.ball,
			this.renderSpringCap(),
			this.renderDangban(),
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

		if (autoRun) {
			this.calculatingLaunchSpeed()
		}
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
				mass: 50,
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
				label: 'springCap',
				isStatic: true,
				render: {
					fillStyle: 'red'
				}
			}
		)
		return cap
	}

	renderDangban = () => {
		const dangban = Bodies.fromVertices(
			boxSize.width - 6,
			6,
			[
				[
					{ x: 0, y: 0 },
					{ x: 18, y: 0 },
					{ x: 18, y: 18 }
				]
			],
			{
				label: 'dangban',
				isStatic: true,
				render: {
					fillStyle: 'orange'
				}
			}
		)
		return dangban
	}

	// 初始化边界
	renderBound = () => {
		const boundTop = Bodies.rectangle(boxSize.width / 2, borderWidth / 2, boxSize.width, borderWidth, {
			label: 'boundTop',
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
				label: 'boundBottom',
				isStatic: true,
				render: {
					fillStyle: 'red'
				}
			}
		)
		const boundLeft = Bodies.rectangle(borderWidth / 2, boxSize.height / 2, borderWidth, boxSize.height, {
			label: 'boundLeft',
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
				label: 'boundRight',
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
				label: 'boundLaunch',
				isStatic: true,
				render: {
					fillStyle: 'purple'
				}
			}
		)

		return [boundTop, boundBottom, boundLeft, boundRight, boundLaunch]
	}

	// 初始化奖品间隔挡板
	renderPrizeDivider = () => {
		const divider = []
		const margin = prizeWidth
		let x = borderWidth + margin + borderWidth / 2
		while (x < boxSize.width - launchContainerWidth - borderWidth * 3) {
			divider.push(
				Bodies.rectangle(x, boxSize.height - prizeHeight / 2, borderWidth, prizeHeight, {
					label: 'prizeDivider',
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
						label: 'obstacle',
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
			prizeGround.push(prize)
			x += margin + borderWidth
		}
		return prizeGround
	}
}

export default LuckyBall
