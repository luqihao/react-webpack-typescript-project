import React, { useEffect } from 'react'
import _ from 'lodash'

function TestSplit() {
	useEffect(() => {
		console.log(_.join(['Another', 'module', 'loaded!'], ' '))
	}, [])
	return <div>TestSplit</div>
}

export default TestSplit
