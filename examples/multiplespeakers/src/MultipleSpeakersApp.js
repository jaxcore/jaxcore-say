import React, {Component} from 'react';
import Speak from 'jaxcore-speak';
import {MonauralScope} from 'jaxcore-client';

global.Speak = Speak;

Speak.setWorkers({
	'espeak': 'webworkers/espeak-all-worker.js',
	
	// if you only need one language (english, french, spanish) then only load that worker
	// 'espeak': 'webworkers/espeak-en-worker.js',
	
	// // the following format is mainly just for this demo for testing the individual language builds
	// 'espeak': [
	// 	{
	// 		language: 'en',
	// 		path: 'webworkers/espeak-en-worker.js'
	// 	},
	// 	{
	// 		language: 'es',
	// 		path: 'webworkers/espeak-es-worker.js'
	// 	},
	// 	{
	// 		language: 'fr',
	// 		path: 'webworkers/espeak-fr-worker.js'
	// 	},
	// ],
	
	'sam': 'webworkers/sam-worker.js'
});

class MultipleSpeakersApp extends Component {
	constructor() {
		super();
		
		this.redRef = React.createRef();
		this.orangeRef = React.createRef();
		this.yellowRef = React.createRef();
		this.greenRef = React.createRef();
		this.cyanRef = React.createRef();
		this.blueRef = React.createRef();
		this.purpleRef = React.createRef();
		
		this.state = {
			text: '',
			activeSpeakers: {
				red: false,
				orange: false,
				yellow: false,
				green: false,
				cyan: false,
				blue: false,
				purple: false
			}
		};
		
		global.app = this;
	}
	
	componentDidMount() {
		const colors = {
			red: '255,0,0',
			orange: '255,128,0',
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
			orange: new MonauralScope(this.orangeRef.current, getTheme('orange')),
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
						<div className={"speakername"+(this.state.activeSpeakers.red?' active':'')}>Jack</div>
						<canvas ref={this.redRef} width="100" height="100"/>
					</div>
					<div id="orange">
						<div className={"speakername"+(this.state.activeSpeakers.orange?' active':'')}>Scotty</div>
						<canvas ref={this.orangeRef} width="100" height="100"/>
					</div>
					<div id="yellow">
						<div className={"speakername"+(this.state.activeSpeakers.yellow?' active':'')}>Roy</div>
						<canvas ref={this.yellowRef} width="100" height="100"/>
					</div>
					<div id="green">
						<div className={"speakername"+(this.state.activeSpeakers.green?' active':'')}>Leon</div>
						<canvas ref={this.greenRef} width="100" height="100"/>
					</div>
					<div id="cyan">
						<div className={"speakername"+(this.state.activeSpeakers.cyan?' active':'')}>Robo</div>
						<canvas ref={this.cyanRef} width="100" height="100"/>
					</div>
					<div id="blue">
						<div className={"speakername"+(this.state.activeSpeakers.blue?' active':'')}>Zhora</div>
						<canvas ref={this.blueRef} width="100" height="100"/>
					</div>
					<div id="purple">
						<div className={"speakername"+(this.state.activeSpeakers.purple?' active':'')}>Cylon</div>
						<canvas ref={this.purpleRef} width="100" height="100"/>
					</div>
				
				</div>
				
				<div id="controls">
					<button onClick={e => this.introduceYourselves()}>Introduce Yourselves</button>
					<button onClick={e => this.clearQueue()}>Stop</button>
				</div>
			</div>
		);
	}
	
	clearQueue() {
		Speak.clearQueue();
	}
	
	setActiveSpeaker(color, active) {
		const {activeSpeakers} = this.state;
		activeSpeakers[color] = active;
		this.setState(activeSpeakers);
	}
	
	introduceYourselves() {
		
		Speak.once('finish', () => {
			console.log('queue finished');
		});
		
		Speak.queue({
			text: "hello, i am jack",
			scope: this.scopes.red,
			options: {
				profile: 'Jack',
				language: 'en'
			},
			onStart: () => {
				console.log('Jack saying: ', this.text);
				this.setActiveSpeaker('red', true);
			},
			onStop: () => {
				console.log('Jack finished saying: ', this.text);
				this.setActiveSpeaker('red', false);
			}
		});
		
		Speak.queue({
			text: "aye this is scotty, gled to meet you",
			scope: this.scopes.orange,
			options: {
				profile: 'Scotty',
				language: 'en-sc'
			},
			onStart: () => {
				console.log('Scotty saying: ', this.text);
				this.setActiveSpeaker('orange', true);
			},
			onStop: () => {
				console.log('Scotty finished saying: ', this.text);
				this.setActiveSpeaker('orange', false);
			}
		});
		

		Speak.queue({
			text: "this is roy, at your service",
			scope: this.scopes.yellow,
			options: {
				profile: 'Roy',
				language: 'en-wm'
			},
			onStart: () => {
				console.log('Roy saying: ', this.text);
				this.setActiveSpeaker('yellow', true);
			},
			onStop: () => {
				console.log('Roy finished saying: ', this.text);
				this.setActiveSpeaker('yellow', false);
			}
		});

		Speak.queue({
			text: "hola, mi nombre es leon",
			scope: this.scopes.green,
			options: {
				profile: 'Leon',
				language: 'es'
			},
			onStart: () => {
				console.log('Leon saying: ', this.text);
				this.setActiveSpeaker('green', true);
			},
			onStop: () => {
				console.log('Leon finished saying: ', this.text);
				this.setActiveSpeaker('green', false);
			}
		});
		
		Speak.queue({
			text: "greetings, i am robo",
			scope: this.scopes.cyan,
			options: {
				profile: 'Robo'
			},
			onStart: () => {
				console.log('Robo saying: ', this.text);
				this.setActiveSpeaker('cyan', true);
			},
			onStop: () => {
				console.log('Robo finished saying: ', this.text);
				this.setActiveSpeaker('cyan', false);
			}
		});

		Speak.queue({
			text: "bonjour. je m'appelle zhora",
			scope: this.scopes.blue,
			options: {
				profile: 'Zhora',
				language: 'fr'
			},
			onStart: () => {
				console.log('Zhora saying: ', this.text);
				this.setActiveSpeaker('blue', true);
			},
			onStop: () => {
				console.log('Zhora finished saying: ', this.text);
				this.setActiveSpeaker('blue', false);
			}
		});

		Speak.queue({
			text: "we are the cylon",
			scope: this.scopes.purple,
			options: {
				profile: 'Cylon',
				language: 'en'
			},
			onStart: () => {
				console.log('Cylon aying: ', this.text);
				this.setActiveSpeaker('purple', true);
			},
			onStop: () => {
				console.log('Cylon finished saying: ', this.text);
				this.setActiveSpeaker('purple', false);
			}
		});
		
	}
	
}

export default MultipleSpeakersApp;
