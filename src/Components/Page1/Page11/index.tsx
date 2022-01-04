import React from 'react'
import { useParams } from 'react-router-dom'

import styles from './index.module.scss'

function Page11() {
	const { number } = useParams()
	return (
		<div className={styles.page}>
			Page11哈哈哈哈
			<div>number: {number}</div>
		</div>
	)
}

export default Page11
