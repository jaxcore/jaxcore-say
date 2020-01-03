const {parentPort} = require('worker_threads');
parentPort.once('message', (message) => {
	switch (message.cmd) {
		case 'speak':
			console.log('message', message);
			let buffer = SamData(message.text, message.options);
			parentPort.postMessage({
				rawdata: buffer
			});
			break;
	}
});