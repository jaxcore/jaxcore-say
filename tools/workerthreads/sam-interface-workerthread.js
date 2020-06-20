const {parentPort} = require('worker_threads');
parentPort.once('message', (message) => {
	switch (message.cmd) {
		case 'speak':
			const text = message.options.replacementText? message.options.replacementText : message.text;
			let buffer = SamData(text, message.options);
			parentPort.postMessage({
				rawdata: buffer
			});
			parentPort.close();
			break;
	}
});