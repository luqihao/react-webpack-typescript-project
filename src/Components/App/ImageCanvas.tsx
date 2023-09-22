import React, { useRef, useEffect } from 'react'

const ImageCanvas = ({ imageSrc, widthRatio, heightRatio }) => {
	const canvasRef = useRef(null) // 引用canvas元素
	const imgRef = useRef(null) // 引用图片元素
	const imgWidthRef = useRef(0) // 图片宽度
	const imgHeightRef = useRef(0) // 图片高度

	useEffect(() => {
		// 加载图片并获取其宽高
		const img = new Image()
		img.src = imageSrc
		img.onload = () => {
			imgRef.current = img
			imgWidthRef.current = img.width
			imgHeightRef.current = img.height

			// 计算画布的宽高
			const canvasWidth =
				imgWidthRef.current < (imgHeightRef.current * 19) / 6
					? imgWidthRef.current
					: (imgHeightRef.current * 19) / 6
			const canvasHeight =
				imgHeightRef.current < (imgWidthRef.current * 6) / 19
					? imgHeightRef.current
					: (imgWidthRef.current * 6) / 19

			// 设置画布的宽高
			canvasRef.current.width = (19 * canvasHeight) / 6
			canvasRef.current.height = canvasHeight

			// 获取2D绘图上下文
			const ctx = canvasRef.current.getContext('2d')

			// 设置背景颜色
			ctx.fillStyle = 'black'
			ctx.fillRect(0, 0, (19 * canvasHeight) / 6, canvasHeight)

			// 在画布上绘制图像
			ctx.drawImage(
				imgRef.current,
				0,
				0,
				imgWidthRef.current,
				imgHeightRef.current,
				((19 * canvasHeight) / 6 - canvasWidth) / 2, // 图像的X坐标，居中
				(canvasHeight - canvasHeight) / 2, // 图像的Y坐标，居中
				canvasWidth,
				canvasHeight
			)
		}
	}, [imageSrc, widthRatio, heightRatio])

	return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}

export default ImageCanvas
