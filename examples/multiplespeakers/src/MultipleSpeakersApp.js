import React, {Component} from 'react';
import Speak from 'jaxcore-speak';
import {MonauralScope} from 'jaxcore-client';
import EventEmitter from 'events';

global.Speak = Speak;

Speak.setWorkers({
	'espeak': [
		{
			language: 'en',
			path: '/webworkers/espeak-en-worker.js'
		},
		{
			language: 'es',
			path: '/webworkers/espeak-es-worker.js'
		},
		{
			language: 'fr',
			path: '/webworkers/espeak-fr-worker.js'
		},
	],
	'sam': '/webworkers/sam-worker.js'
});

class SpeakerQueue extends EventEmitter {
	constructor() {
		super();
		this._queue = [];
		this.speaker = new Speak();
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

const speakerQueue = new SpeakerQueue();
Speak.speakerQueue = speakerQueue;
Speak.queue = speakerQueue.queue.bind(speakerQueue);
Speak.on = speakerQueue.on.bind(speakerQueue);
Speak.once = speakerQueue.once.bind(speakerQueue);

class MultipleSpeakersApp extends Component {
	constructor() {
		super();
		
		this.redRef = React.createRef();
		this.yellowRef = React.createRef();
		this.greenRef = React.createRef();
		this.cyanRef = React.createRef();
		this.blueRef = React.createRef();
		this.purpleRef = React.createRef();
		
		this.state = {
			text: '',
			count: 0,
			loop: false
		};
		
		global.app = this;
	}
	
	componentDidMount() {
		const colors = {
			red: '255,0,0',
			yellow: '255,255,0',
			green: '0,255,0',
			cyan: '0,255,255',
			blue: '0,0,255',
			purple: '255,0,255',
		};
		
		const getTheme = function (color) {
			return {
				strokeColor: 'rgb(' + colors[color] + ')',
				clipColor: 'black',
				fillColor: 'rgba(' + colors[color] + ',0.2)',
				dotColor: 'rgb(' + colors[color] + ')',
				bgOffColor: '#fafafa',
				bgOnColor: '#eee'
			}
		};
		
		this.scopes = {
			red: new MonauralScope(this.redRef.current, getTheme('red')),
			yellow: new MonauralScope(this.yellowRef.current, getTheme('yellow')),
			green: new MonauralScope(this.greenRef.current, getTheme('green')),
			cyan: new MonauralScope(this.cyanRef.current, getTheme('cyan')),
			blue: new MonauralScope(this.blueRef.current, getTheme('blue')),
			purple: new MonauralScope(this.purpleRef.current, getTheme('purple'))
		};
		
	}
	
	render() {
		return (
			<div>
				
				<div id="scopes">
					<div id="red">
						<div className="speakername">Jack</div>
						<canvas ref={this.redRef} width="100" height="100"/>
					</div>
					<div id="yellow">
						<div className="speakername">Roy</div>
						<canvas ref={this.yellowRef} width="100" height="100"/>
					</div>
					<div id="green">
						<div className="speakername">Leon</div>
						<canvas ref={this.greenRef} width="100" height="100"/>
					</div>
					<div id="cyan">
						<div className="speakername">Robo</div>
						<canvas ref={this.cyanRef} width="100" height="100"/>
					</div>
					<div id="blue">
						<div className="speakername">Zhora</div>
						<canvas ref={this.blueRef} width="100" height="100"/>
					</div>
					<div id="purple">
						<div className="speakername">Cylon</div>
						<canvas ref={this.purpleRef} width="100" height="100"/>
					</div>
				
				</div>
				
				<div id="controls">
					
					<button onClick={e => this.introduceYourselves()}>Introduce Yourselves</button>
					
					<br/>
					loop: <input type="checkbox" value={this.state.loop} onChange={e => {
					this.setState({loop: !this.state.loop})
				}}/>
					{this.state.count > 0 ? this.state.count : ''}
				
				</div>
			</div>
		);
	}
	
	introduceYourselves() {
		this.setState({
			count: this.state.count + 1
		});
		
		speakerQueue.once('finish', () => {
			console.log('queue finished');
			if (this.state.loop) {
				setTimeout(() => {
					this.introduceYourselves();
				}, 1);
			}
		});
		
		Speak.queue({
			text: "hello, i am jack",
			scope: this.scopes.red,
			options: {
				profile: 'Jack',
				language: 'en',
				delay: 1
			},
			onStart: function () {
				console.log('saying: ', this.text)
			},
			onStop: function () {
				console.log('finished saying: ', this.text)
			}
		});

		Speak.queue({
			text: "this is roy, at your service",
			scope: this.scopes.yellow,
			options: {
				profile: 'Roy',
				language: 'en',
				delay: 1
			},
			onStart: function () {
				console.log('saying: ', this.text)
			},
			onStop: function () {
				console.log('finished saying: ', this.text)
			}
		});

		Speak.queue({
			text: "hola, mi nombre es leon",
			scope: this.scopes.green,
			options: {
				profile: 'Leon',
				language: 'es'
			},
			onStart: function () {
				console.log('saying: ', this.text)
			},
			onStop: function () {
				console.log('finished saying: ', this.text)
			}
		});
		
		Speak.queue({
			text: "greetings, i am robo",
			scope: this.scopes.cyan,
			options: {
				profile: 'Robo'
			},
			onStart: function() {
				console.log('saying: ', this.text)
			},
			onStop: function() {
				console.log('finished saying: ', this.text)
			}
		});

		Speak.queue({
			text: "bonjour. je m'appelle zhora",
			scope: this.scopes.blue,
			options: {
				profile: 'Zhora',
				language: 'fr'
			},
			onStart: function () {
				console.log('saying: ', this.text)
			},
			onStop: function () {
				console.log('finished saying: ', this.text)
			}
		});

		Speak.queue({
			text: "we are the cylon",
			scope: this.scopes.purple,
			options: {
				profile: 'Cylon',
				language: 'en'
			},
			onStart: function () {
				console.log('saying: ', this.text)
			},
			onStop: function () {
				console.log('finished saying: ', this.text)
			}
		});
		
	}
	
}

export default MultipleSpeakersApp;
