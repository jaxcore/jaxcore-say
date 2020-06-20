
self.addEventListener('message', function(e) {
	var data = e.data;
	switch (data.cmd) {
		case 'speak':
			const text = data.options.replacementText? data.options.replacementText : data.text;
			let buffer = SamData(text, data.options);
			self.postMessage({
				rawdata: buffer
			});
			self.close();
			break;
	}
}, false);