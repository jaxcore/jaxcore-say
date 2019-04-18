
self.addEventListener('message', function(e) {
	var data = e.data;
	switch (data.cmd) {
		case 'speak':
			let buffer = SamData(data.text, data.options);
			self.postMessage({
				rawdata: buffer
			});
			self.close();
			break;
	}
}, false);