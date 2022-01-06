import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { observer } from 'mobx-react'

import styles from './index.module.scss'
import { useRootStore } from '@utils/customHooks'

function Page1() {
	const { globalStore } = useRootStore()
	const { count, addCount, doubleCount } = globalStore
	return (
		<div className={styles.page}>
			Page1
			<Link to="/page2">go to page2</Link>
			<Link to="/page1/345">go to 345</Link>
			<div>count: {count}</div>
			<div>doubleCount: {doubleCount}</div>
			<button onClick={addCount}>addCount</button>
			<Outlet />
		</div>
	)
}

export default observer(Page1)
