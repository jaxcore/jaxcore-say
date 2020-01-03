const path = require('path');

module.exports = function(env) {
	if (env.startsWith('workerthread')) {
		let name;
		if (env === 'workerthreaden') {
			name = 'espeak-en-workerthread';
		}
		if (env === 'workerthreadall') {
			name = 'espeak-all-workerthread';
		}
		if (env === 'workerthreadsam') {
			name = 'sam-workerthread';
		}
		console.log('building workerthread', name);
		return {
			entry: './tools/workerthreads/'+name+'.js',
			output: {
				filename: name+'.js',
				path: path.resolve(__dirname, 'dist')
			}
		};
	}
	else {
		let name = (env === 'sam') ? 'sam-worker' : 'espeak-' + env + '-worker';
		console.log('building', name);
		return {
			entry: './tools/webworkers/' + name + '.js',
			output: {
				filename: name + '.js',
				path: path.resolve(__dirname, 'dist')
			}
		};
	}
};