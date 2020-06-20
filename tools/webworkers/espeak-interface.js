
self.addEventListener('message', function(e) {
	var data = e.data;
	switch (data.cmd) {
		case 'speak':
			const text = data.options.replacementText? data.options.replacementText : data.text;
			data.options.rawdata = 'raw';
			let rawdata = meSpeak.speak(text, data.options);
			self.postMessage({
				rawdata: rawdata
			});
			self.close();
			break;
	}
}, false);