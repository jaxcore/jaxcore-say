const path = require('path')

module.exports = function(env) {
	let name = (env === 'sam')? 'sam-worker' : 'espeak-'+env+'-worker';
	console.log('building', name);
	return {
		entry: './tools/webworkers/'+name+'.js',
		output: {
			filename: name+'.js',
			path: path.resolve(__dirname, 'dist')
		}
	};
};