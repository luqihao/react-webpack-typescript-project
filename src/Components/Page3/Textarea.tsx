import React, { useEffect, useRef } from 'react'

function useClickAway(targetRef) {
	useEffect(() => {
		function handleClickOutside(event) {
			if (targetRef.current && document.getElementById('setting').contains(event.target)) {
				event.preventDefault()
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [targetRef])
}
const textStyle = {
	border: '1px solid #000'
}
const Textarea = () => {
	const textareaRef = useRef(null)
	useClickAway(textareaRef)
	return (
		<div
			style={textStyle}
			ref={textareaRef}
			contentEditable
			dangerouslySetInnerHTML={{ __html: '弗兰克就是独家开发和会计师大会开放后开始多久啊后付款计划打卡十分好看' }}
		/>
	)
}

export default Textarea
