const scriptRules = require('./script')
const styleRules = require('./style')
const fileRules = require('./file')

module.exports = [...scriptRules, ...styleRules, ...fileRules]
