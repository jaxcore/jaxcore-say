const {parentPort} = require('worker_threads');
parentPort.once('message', (message) => {
	switch (message.cmd) {
		case 'speak':
			message.options.rawdata = 'raw';
			let rawdata = meSpeak.speak(message.text, message.options);
			parentPort.postMessage({
				rawdata: rawdata
			});
			break;
	}
});