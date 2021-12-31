import React from 'react'
import { Link, Outlet } from 'react-router-dom'

import styles from './index.module.scss'

function Page1() {
	return (
		<div className={styles.page}>
			Page1
			<Link to="/page2">go to page2</Link>
			<Link to="/page1/345">go to 345</Link>
			<Outlet />
		</div>
	)
}

export default Page1
