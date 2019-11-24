import EventEmitter from 'events';

class MonauralScope extends EventEmitter {
	constructor(canvas, options) {
		super();
		if (!options) options = {};
		
		this.canvas = canvas;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.audioContext = null;
		this.meter = null;
		this.mediaStreamSource = null;
		this._draw = this.draw.bind(this);
		this.isRecording = false;
		
		this.setTheme({
			lineWidth: options.lineWidth || 3,
			strokeColor: options.strokeColor || '#FF0000',
			clipColor: options.clipColor || (options.strokeColor || '#FF0000'),
			fillColor: options.fillColor || 'rgba(255,0,0,0.1)',
			bgOnColor: options.bgOnColor || null,
			bgOffColor: options.bgOffColor || null,
			dotColor: options.dotColor || '#FF0000',
			dotSize: options.dotSize || 3,
			background: options.background || null
		});
		
	}
	
	setTheme(options) {
		this.theme = options;
		this.draw();
	}
	
	createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
		// this.audioContext = audioContext;
		
		var processor = audioContext.createScriptProcessor(512);
		//this.processor = processor;
		processor.onaudioprocess = function (event) {
			
			var buf = event.inputBuffer.getChannelData(0);
			var bufLength = buf.length;
			var sum = 0;
			var x;
			
			// Do a root-mean-square on the samples: sum up the squares...
			for (var i = 0; i < bufLength; i++) {
				x = buf[i];
				if (Math.abs(x) >= this.clipLevel) {
					this.clipping = true;
					this.lastClip = window.performance.now();
				}
				sum += x * x;
			}
			
			// ... then take the square root of the sum.
			var rms = Math.sqrt(sum / bufLength);
			
			// Now smooth this out with the averaging factor applied
			// to the previous sample - take the max here because we
			// want "fast attack, slow release."
			this.volume = Math.max(rms, this.volume * this.averaging);
			
			// console.log('onaudioprocess', this.volume);
			
			if (!this.maxVolume) this.maxVolume = this.volume;
			this.maxVolume = Math.max(this.volume, this.maxVolume);
		};
		
		processor.clipping = false;
		processor.lastClip = 0;
		processor.volume = 0;
		processor.clipLevel = clipLevel || 0.99; //0.98;
		processor.averaging = averaging || 0.97; //0.95;
		processor.clipLag = clipLag || 500; //750;
		processor.connect(audioContext.destination);
		
		processor.checkClipping =
			function () {
				if (!this.clipping)
					return false;
				if ((this.lastClip + this.clipLag) < window.performance.now())
					this.clipping = false;
				return this.clipping;
			};
		
		processor.shutdown =
			function () {
				this.disconnect();
				this.onaudioprocess = null;
			};
		
		return processor;
	}
	
	setIsRecording(isRecording) {
		if (this.isRecording === isRecording) {
			console.log('same');
			return;
		}
		this.isRecording = isRecording;
		if (isRecording) this.startRecording();
		else this.stopRecording();
	}
	
	stopRecording() {
		if (this.isRecording) {
			// if (this.audioContext) {
			// 	if (this.meter) {
			// 		this.meter.disconnect(this.audioContext.destination);
			// 	}
			// } else {
			// 	console.log('error: no audioContext');
			// }
			if (this.mediaStreamSource && this.meter) {
				this.mediaStreamSource.disconnect(this.meter);
			}
			if (this.meter) {
				this.meter.shutdown();
			}
			if (this.audioContext) {
				this.audioContext.close();
			}
		}
		this.isRecording = false;
		this.isDrawing = false;
	}
	
	// start and stop the mic to bring up the request dialog
	requestMic() {
		this.startRecording(() => {
			// sucess
			this.stopRecording();
		}, () => {
			// error
			this.stopRecording();
		});
	}
	
	startRecording(successcb, errorcb) {
		if (this.isRecording) {
			console.log('already recording');
			return;
		}
		
		console.log('startRecording');
		this.isRecording = true;
		
		let _AudioContext = window.AudioContext || window.webkitAudioContext;
		let audioContext = new _AudioContext();
		this.audioContext = audioContext;
		
		const success = (stream) => {
			console.log('startRecording success');
			if (this.audioContext) {
				try {
					this.mediaStreamSource = audioContext.createMediaStreamSource(stream);
					this.meter = this.createAudioMeter(audioContext);
					this.mediaStreamSource.connect(this.meter);
					this.startDrawing();
					if (successcb) successcb();
				}
				catch(e) {
					if (errorcb) errorcb();
				}
			}
		};
		
		const fail = (e) => {
			console.log('startRecording fail');
			//debugger;
			if (errorcb) errorcb();
		};
		
		try {
			// let getUserMedia = get_user_media || navigator.webkitGetUserMedia;
			// get_user_media = get_user_media || navigator.mozGetUserMedia;
			// let getUserMedia = navigator.getUserMedia || (navigator.webkitGetUserMedia || navigator.mediaDevices.getUserMedia);
			if (navigator.getUserMedia) {
				navigator.getUserMedia(
					{
						"audio": {
							"mandatory": {
								"googEchoCancellation": "false",
								"googAutoGainControl": "false",
								"googNoiseSuppression": "false",
								"googHighpassFilter": "false"
							},
							"optional": []
						},
					}, success, fail);
			}
			else {
				if (navigator.mediaDevices.getUserMedia) {
					navigator.mediaDevices.getUserMedia(
						{
							"audio": {
								"mandatory": {
									"googEchoCancellation": "false",
									"googAutoGainControl": "false",
									"googNoiseSuppression": "false",
									"googHighpassFilter": "false"
								},
								"optional": []
							},
						}, success, fail);
				}
				else {
					throw new Error('no getUserMedia');
					return;
				}
			}
		} catch (e) {
			alert('getUserMedia threw exception :' + e);
		}
	}
	
	loadAudioData(audioContext, source, callback) {
		this.audioContext = audioContext;
		this.source = source;
		
		source.connect(audioContext.destination);
		
		let meter = this.createAudioMeter(audioContext);
		this.meter = meter;
		
		source.connect(this.meter);
		
		source.onended = () => {
			this.isPlaying = false;
			// source.disconnect(audioContext.destination);
			source.disconnect();
			delete source.buffer;
			// this.meter.shutdown();
			source.stop();
			this.stopDrawing();
			
			audioContext.close();
			// source.disconnect();
			
			if (callback) callback();
		};
		
		this.isPlaying = true;
		this.startDrawing();
		source.start(0);
	}
	
	startDrawing() {
		this.isDrawing = true;
		this.draw()
	}
	
	stopDrawing() {
		this.meter.volume = 0;
		this.draw();
		this.isDrawing = false;
	}
	
	draw() {
		
		if (!this.canvas) {
			console.log('no canvas');
			return;
		}
		
		let ctx = this.canvas.getContext('2d');
		if (this.theme.background) {
			ctx.fillStyle = this.theme.background;
			ctx.fillRect(0, 0, this.width, this.height);
		} else {
			ctx.clearRect(0, 0, this.width, this.height);
		}
		
		if (this.theme.bgOnColor || this.theme.bgOffColor) {
			let maxsize = (Math.min(this.width, this.height) / 2) - ctx.lineWidth;
			ctx.beginPath();
			ctx.arc(this.width / 2, this.height / 2, maxsize, 0, 2 * Math.PI, false);
			ctx.fillStyle = (this.isPlaying || this.isRecording)? this.theme.bgOnColor : this.theme.bgOffColor;
			ctx.fill();
			ctx.closePath();
		}
		
		ctx.lineWidth = this.theme.lineWidth;
		if (this.theme.dotSize) {
			let size = this.theme.dotSize;
			ctx.beginPath();
			ctx.arc(this.width / 2, this.height / 2, size, 0, 2 * Math.PI, false);
			ctx.fillStyle = this.theme.dotColor;
			ctx.fill();
			ctx.closePath();
		}
		
		if (!this.isRecording && !this.isDrawing) {
			console.log('not drawing');
		} else {
			// console.log('IS drawing ', this.meter.volume);
			
			if (!this.meter) {
				console.error('no meter');
				// this.startDrawing();
				// this.startRecording();
				return;
			}
			
			ctx.strokeStyle = this.meter.checkClipping() ? this.theme.clipColor : this.theme.strokeColor;
			
			let maxsize = (Math.min(this.width, this.height) / 2) - ctx.lineWidth;
			let size = this.meter.volume * maxsize * 5;
			if (size > this.width / 2 - this.theme.lineWidth) size = this.width / 2 - this.theme.lineWidth;
			ctx.beginPath();
			
			ctx.arc(this.width / 2, this.height / 2, size, 0, 2 * Math.PI, false);
			if (this.theme.fillColor) {
				ctx.fillStyle = this.theme.fillColor;
				ctx.fill();
			}
			ctx.stroke();
			ctx.closePath();
			
			if (this.isDrawing) {
				window.requestAnimationFrame(this._draw);
			}
		}
	}
	
}

export default MonauralScope;