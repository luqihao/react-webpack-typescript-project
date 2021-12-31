import React from 'react'
import { Link } from 'react-router-dom'

import styles from './index.module.scss'

function Page2() {
	return (
		<div className={styles.page}>
			Page2
			<Link to="/page1">go to page1</Link>
		</div>
	)
}

export default Page2
