const {parentPort} = require('worker_threads');
parentPort.once('message', (message) => {
	switch (message.cmd) {
		case 'speak':
			const text = message.options.replacementText? message.options.replacementText : message.text;
			message.options.rawdata = 'raw';
			let rawdata = meSpeak.speak(text, message.options);
			parentPort.postMessage({
				rawdata: rawdata
			});
			parentPort.close();
			break;
	}
});