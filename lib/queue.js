import EventEmitter from "events";

class SpeakerQueue extends EventEmitter {
	constructor(speak) {
		super();
		this._queue = [];
		this.speaker = speak;
	}
	
	clearQueue() {
		this._queue = [];
	}
	queue(speech) {
		this._queue.push(speech);
		this._speakNext();
	}
	
	_speakNext() {
		if (this.isSpeaking) {
			return;
		}
		let next = this._queue.shift();
		if (next) {
			this.isSpeaking = true;
			
			this.speaker.getWorkerAudioData(next.text, next.options, (audioContext, source) => {
				if (next.onStart) {
					next.onStart(next);
				}
				next.scope.loadAudioData(audioContext, source, () => {
					if (next.onStop) {
						setTimeout(() => {
							next.onStop(next);
						}, 1);
					}
					this._onEnded();
				});
			});
		} else {
			this.emit('finish');
		}
	}
	
	_onEnded() {
		this.isSpeaking = false;
		this._speakNext();
	}
}

export default SpeakerQueue;