import React, { useEffect, useRef } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import styles from './index.module.scss'
import { useRootStore } from '@utils/customHooks'
import { getPlusRes } from '@utils/math'
import Textarea from '@components/Page3/Textarea'

function Page1() {
	const { globalStore } = useRootStore()
	const { count, addCount, doubleCount } = globalStore
	useEffect(() => {
		console.log('page1 getPlusRes', getPlusRes(2, 3))
	}, [])

	return <Textarea />
}

export default observer(Page1)
