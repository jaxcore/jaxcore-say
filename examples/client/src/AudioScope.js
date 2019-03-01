
import EventEmitter from 'events';

function Processor(audioContext, canvas, options) {
	if (!options) {
		options = {};
	}
	this.background = options.background || '#000';
	this.buffersize = options.buffersize || 512;
	
	
	this.setAudio(audioContext);
	
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.context.fillStyle = '#000';
	this.context.fillRect(0,0, this.canvas.width, this.canvas.height);
	
	this.xp = 0;
	this.yp = 0;
	
	this.themes = {
		lines: {
			dotSize: 0,
			dotStrokeWidth: 0,
			dotStrokeColor: null,
			dotFillColor: null,
			lineThickness: options.lineThickness || 1,
			lineCap: 'round',
			lineColor: options.color || '#FFF'
		},
		dots: {
			dotSize: options.dotSize || 6,
			dotStrokeWidth: null,
			dotStrokeColor: null,
			dotFillColor: options.color || '#FFF',
			lineThickness: 0,
			lineCap: null,
			lineColor: null
		}
	};
	
	this.theme = options.dotSize? this.themes.dots : this.themes.lines;
	
	this.paused = false;
}

Processor.prototype.setAudio = function (audioContext) {
	this.audioContext = audioContext;
	this.node = this.audioContext.createScriptProcessor(this.buffersize, 2, 2);
	this.node.connect(this.audioContext.destination);
	this.node.onaudioprocess = (data) => {
		this.process(data)
	};
};
Processor.prototype.disconnect = function () {
	console.log('processor disconnect');
	this.node.onaudioprocess = null;
	this.node.disconnect(this.audioContext.destination);
	delete this.node;
	delete this.audioContext;
	//delete this.node;
};
Processor.prototype.setPaused = function (paused) {
	this.paused = paused;
};
Processor.prototype.process = function (_event) {
	// console.log('process...', this.paused);
	
	var inL = _event.inputBuffer.getChannelData(0);
	var inR = _event.inputBuffer.getChannelData(1);
	var outL = _event.outputBuffer.getChannelData(0);
	var outR = _event.outputBuffer.getChannelData(1);
	
	if (!this.paused) {
		
		var width = this.canvas.width;
		var height = this.canvas.height;
		
		this.context.fillStyle = '#000';
		this.context.fillRect(0,0, this.canvas.width, this.canvas.height);
		
	}
	
	for (var iBuffer = 0; iBuffer < this.buffersize; iBuffer++) {
		outL[iBuffer] = inL[iBuffer];
		outR[iBuffer] = inR[iBuffer];
		
		console.log('proc', inL[iBuffer], inR[iBuffer]);
		
		if (!this.paused) {
			var x = (inL[iBuffer] + 1.0) * 0.5 * width;
			var y = (1.0 - inR[iBuffer]) * 0.5 * height;
			
			
			if (this.xp===0 && this.yp===0) {
			
			}
			else {
				if (this.theme.dotSize) {
					this.context.globalAlpha = this.theme.dotAlpha;
					this.context.lineCap = this.theme.lineCap;
					if (this.theme.dotFillColor) this.context.fillStyle = this.theme.dotFillColor;
					if (this.theme.dotStrokeWidth) this.context.lineWidth = this.theme.dotStrokeWidth;
					if (this.theme.dotStrokeColor) this.context.strokeStyle = this.theme.dotStrokeColor;
					this.context.beginPath();
					if (this.theme.dotStrokeWidth) {
						this.context.arc(x, y, (this.theme.dotSize + this.theme.dotStrokeWidth) * 0.5, 0.0, 2.0 * Math.PI, false);
						// this.context.stroke();
						this.context.fill();
					}
					this.context.arc(x, y, this.theme.dotSize * 0.5, 0.0, 2.0 * Math.PI, false);
					if (this.theme.dotFillColor) {
						this.context.fill();
					}
				}
				
				if (this.theme.lineThickness) {
					// this.context.globalAlpha = this.theme.lineAlpha;
					this.context.strokeStyle = this.theme.lineColor;
					this.context.lineCap = this.theme.lineCap;
					this.context.lineWidth = this.theme.lineThickness;
				
						this.context.beginPath();
						this.context.moveTo(x, y);
						this.context.lineTo(this.xp, this.yp);
						this.context.stroke();
				}
			}
			
			this.xp = x;
			this.yp = y;
		}
	}
};


class AudioScope extends EventEmitter {
	
	constructor(canvas) {
		super();
		if (canvas) this.canvas = canvas;
		
		this.buffer = null;
		this.source = null;
		
		this.isPlaying = false;
		this.isPaused = false;
		
		global.audioscope = this;
	}
	
	loadAudio(audioData) {
		let audio = new (window.AudioContext || window.webkitAudioContext)();
		this.audio = audio;
		
		this.vectorscope = new Processor(this.audio, this.canvas);
		
		
		var reader = new FileReader();
		reader.onload = () => {
			this.audio.decodeAudioData(reader.result, (_data) => {
				this.buffer = _data;
				
				console.log('tune loaded.');
				this.play();
			});
		};
		reader.readAsArrayBuffer(audioData);
	}
	
	loadAudioData(audioContext, src, buffer) {
		// let audio = new (window.AudioContext || window.webkitAudioContext)();
		this.audio = audioContext;
		this.source = src;
		this.processor = new Processor(this.audio, this.canvas);
		// this.processor.node.connect(this.audio.destination);
		this.buffer = buffer;
	}
	
	setAudioContext(audioContext) {
		this.stop();
		if (this.audio) {
			alert('audio context exists');
			
			return;
			// this.audio.close();
			// delete this.audio;
			// alert('clean');
		}
	}
	
	stop(audio) {
		if (this.source) {
			this.source.stop();
		}
		this.isPlaying = false;
	}
	
	setSpeed(ratio) {
		this.source.mozPreservesPitch = false;
		this.source.webkitPreservesPitch = false;
		this.source.preservesPitch = false;
		this.source.playbackRate.value = ratio;
	};
	
	pause() {
		if (!this.isPlaying) return;
		console.log('pausing');
		this.isPaused = true;
		this._pausePlaybackRate = this.source.playbackRate.value;
		this.processor.setPaused(true);
		this.source.playbackRate.value = 0;
	};
	
	play() {
		if (this.isPaused) {
			console.log('unpausing');
			this.isPaused = false;
			this.processor.setPaused(false);
			this.source.playbackRate.value = this._pausePlaybackRate;
		}
		// else if (this.isPlaying) {
		// 	console.log('isplaying');
		// 	return;
		// }
		else if (this.buffer) {
			
			console.log('pla y1 x');
			
			this.isPaused = false;
			this.processor.setPaused(false);
			
			// this.audio = audio;
			// this.source = this.audio.createBufferSource();
			// this.source.buffer = this.buffer;
			
			this.source.mozPreservesPitch = false;
			this.source.webkitPreservesPitch = false;
			this.source.preservesPitch = false;
			this.source.playbackRate.value = 1;
			
			this.source.onended = () => {
				this.disconnect();
			};
			
			this.source.connect(this.processor.node);
			this.source.start(0);
			
			// this.isPlaying = true;
			
			// setInterval(() => {
			// 	app.stars.draw();
			// },100);
			// this.stars.start(this.starsRef.current, this.visRef.current);
		}
	}
	
	disconnect() {
		this.processor.node.connect(this.audio.destination);
		this.processor.disconnect();
		// this.processor.node.disconnect();
		this.source.disconnect(this.processor.node);
		// this.source.context.close();
		this.audio.close();
		
		delete this.processor;
		delete this.audio;
		delete this.source;
		delete this.buffer;
		
		console.log('disconnect');
		this.emit('destroy');
	}
}


export default AudioScope;