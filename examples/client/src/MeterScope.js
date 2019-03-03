// import React, {Component} from 'react';
import EventEmitter from 'events';


class MeterScope extends EventEmitter {
	constructor(canvas, options) {
		super();
		if (!options) options = {};
		
		// this.canvasRef = canvasRef;
		this.canvas = canvas;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		
		this.audioContext = null;
		this.meter = null;
		
		//this.ctx = null;
		// var WIDTH=500;
		// var HEIGHT=50;
		// var rafID = null;
		
		this.mediaStreamSource = null;
		this._draw = this.draw.bind(this);
		
		this.isRecording = false;
		
		this.lineWidth = options.lineWidth || 3;
		this.theme = {
			color: options.color || '#0000FF',
			clipColor: options.clipColor || '#FFFFFF',
			background: options.background || '#000000'
		};
		
		global.vis = this;
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
			
			if (!this.maxVolume) this.maxVolume = this.volume;
			this.maxVolume = Math.max(this.volume, this.maxVolume);
			
			// console.log('process', this.volume, this.maxVolume);
		};
		
		processor.clipping = false;
		processor.lastClip = 0;
		processor.volume = 0;
		processor.clipLevel = clipLevel || 0.99; //0.98;
		processor.averaging = averaging || 0.97; //0.95;
		processor.clipLag = clipLag || 500; //750;
		
		// this will have no effect, since we don't copy the input to the output,
		// but works around a current Chrome bug.
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
		this.mediaStreamSource.context.close();
		this.mediaStreamSource.disconnect(this.meter);
		this.meter.disconnect(this.audioContext.destination);
		// this.audioContext.close();
		this.isDrawing = false;
	}
	
	startRecording() {
		console.log('startRecording ?');
		//let ctx = this.canvasRef.current.getContext('2d');
		
		// grab our canvas
		// ctx = document.getElementById("meter").getContext("2d");
		
		// monkeypatch Web Audio
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		
		// grab an audio context
		let audioContext = new AudioContext();
		
		
		const success = (stream) => {
			console.log('startRecording success');
			
			// Create an AudioNode from the stream.
			this.mediaStreamSource = audioContext.createMediaStreamSource(stream);
			
			// Create a new volume meter and connect it.
			this.meter = this.createAudioMeter(audioContext);
			this.mediaStreamSource.connect(this.meter);
			
			// kick off the visual updating
			// this.drawLoop();
			this.startDrawing();
		};
		
		const fail = (e) => {
			console.log('startRecording fail');
			debugger;
		};
		
		// Attempt to get audio input
		try {
			// monkeypatch getUserMedia
			navigator.getUserMedia =
				navigator.getUserMedia ||
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia;
			
			// ask for an audio input
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
		} catch (e) {
			alert('getUserMedia threw exception :' + e);
		}
	}
	
	loadAudioData(audioContext, source) {
		// let audio = new (window.AudioContext || window.webkitAudioContext)();
		this.audioContext = audioContext;
		this.source = source;
		
		source.connect(audioContext.destination);
		
		let meter = this.createAudioMeter(audioContext);
		this.meter = meter;
		
		source.connect(this.meter);
		
		source.onended = () => {
			source.disconnect(audioContext.destination);
			this.meter.shutdown();
			//meter.disconnect(this.audioContext.destination);
			source.stop();
			this.stopDrawing();
			
			console.log('max', this.meter.maxVolume);
		};
		
		this.startDrawing();
		source.start(0);
		
		// this.source.connect(this.meter);
		
		// this.source.onended = () => {
		// 	this.source.stop();
		// };
		// this.source.start(0);
		
		// debugger;
		
		//this.processor = new Processor(this.audio, this.canvas);
		// this.processor.node.connect(this.audio.destination);
		// this.buffer = buffer;
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
		}
		else {
			ctx.clearRect(0, 0, this.width, this.height);
		}
		
		ctx.lineWidth = this.lineWidth;
		
		// if (!this.props.isRecording || !this.meter) {
		if (!this.meter) {
			ctx.strokeStyle = this.theme.color;
			
			console.log('not drawing');
			// let maxsize = (Math.min(this.width, this.height) / 2) - ctx.lineWidth;
			let size = 1;
			ctx.beginPath();
			ctx.arc(this.width/2, this.height/2, size, 0, 2 * Math.PI, false);
			ctx.stroke();
			ctx.closePath();
		}
		else {
			console.log('IS drawing ', this.meter.volume);
			
			ctx.strokeStyle = this.meter.checkClipping()? this.theme.clipColor : this.theme.color;
			
			// clear the background
			// ctx.clearRect(0, 0, this.width, this.height);
			// check if we're currently clipping
			
			let maxsize = (Math.min(this.width, this.height) / 2) - ctx.lineWidth;
			let size = this.meter.volume * maxsize * 5;
			
			ctx.beginPath();
			ctx.arc(this.width/2, this.height/2, size, 0, 2 * Math.PI, false);
			ctx.stroke();
			ctx.closePath();
			
			// if (this.meter.checkClipping()) {
			// 	ctx.fillStyle = "red";
			// } else {
			// 	ctx.fillStyle = "green";
			// }
			// ctx.fillRect(0, 0, this.meter.volume * this.width * 1.4, this.height);
			
			if (this.isDrawing) {
				
				window.requestAnimationFrame(this._draw);
			}
			else {
				console.log('nope isDrawing');
			}
		}
	}
	
}

export default MeterScope;