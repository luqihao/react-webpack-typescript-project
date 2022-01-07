const IS_DEV = process.env.NODE_ENV === 'development'
const IS_PROD = process.env.NODE_ENV === 'production'
const APP_ENV = process.env.APP_ENV

const file_extensions = ['.ts', '.tsx', '.js', '.jsx']

module.exports = {
	IS_DEV,
	IS_PROD,
	APP_ENV,
	file_extensions,
}
