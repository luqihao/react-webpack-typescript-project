type SvgrComponent = React.StatelessComponent<React.SVGAttributes<SVGElement>>
declare module '*.svg' {
	const src: string
	export default src
}

declare module '*.png' {
	const content: any
	export default content
}
declare module '*.jpg' {
	const content: any
	export default content
}
declare module '*.jpeg' {
	const content: any
	export default content
}
declare module '*.gif' {
	const content: any
	export default content
}

// for css-module
declare module '*.scss' {
	const content: any
	export = content
}
