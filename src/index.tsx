import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Route, Routes, HashRouter } from 'react-router-dom'
import { getEnv } from '@contants/index'
import RootProvider from '@components/common/RootProvider'
// import loadable from '@loadable/component'

getEnv()

// import App from '@Components/App'
// import NotFound from '@Components/NotFound'
// import Page1 from '@Components/Page1'
// import Page11 from '@Components/Page1/Page11'
// import Page12 from '@Components/Page1/Page12'
// import Page2 from '@Components/Page2'

// React.lazy不支持服务端渲染，打包出来的index.module.js比@loadable/component更小
const App = lazy(() => import(/* webpackChunkName: 'App' */ '@components/App'))
// 如果vscode报格式错误，可能是这个原因：https://blog.csdn.net/wn1245343496/article/details/121006978
const NotFound = lazy(
	() => import(/* webpackChunkName: 'NotFound' */ '@components/NotFound')
)
const Page1 = lazy(
	() => import(/* webpackChunkName: 'Page1' */ '@components/Page1')
)
const Page11 = lazy(
	() => import(/* webpackChunkName: 'Page11' */ '@components/Page1/Page11')
)
const Page12 = lazy(
	() => import(/* webpackChunkName: 'Page12' */ '@components/Page1/Page12')
)
const Page2 = lazy(
	() => import(/* webpackChunkName: 'Page2' */ '@components/Page2')
)

// @loadable/component支持服务端渲染
// const App = loadable(() => import('@Components/App'))
// const NotFound = loadable(() => import('@Components/NotFound'))
// const Page1 = loadable(() => import('@Components/Page1'))
// const Page11 = loadable(() => import('@Components/Page1/Page11'))
// const Page12 = loadable(() => import('@Components/Page1/Page12'))
// const Page2 = loadable(() => import('@Components/Page2'))

ReactDOM.render(
	<RootProvider>
		{/* 使用React.lazy时一定要用Suspense包住，否则报错 */}
		<Suspense fallback={<div>loading</div>}>
			<HashRouter>
				<Routes>
					<Route path="/" element={<App />} />
					<Route path="page1" element={<Page1 />}>
						<Route path="page11" element={<Page11 />} />
						<Route path="page12" element={<Page12 />} />
						<Route path=":number" element={<Page11 />} />
					</Route>
					<Route path="page2" element={<Page2 />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</HashRouter>
		</Suspense>
	</RootProvider>,
	document.getElementById('app')
)
