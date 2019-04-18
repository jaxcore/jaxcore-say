
self.addEventListener('message', function(e) {
	var data = e.data;
	switch (data.cmd) {
		case 'speak':
			data.options.rawdata = 'raw';
			let rawdata = meSpeak.speak(data.text, data.options);
			self.postMessage({
				rawdata: rawdata
			});
			self.close();
			break;
	}
}, false);