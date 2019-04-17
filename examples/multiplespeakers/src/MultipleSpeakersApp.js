import React, {Component} from 'react';
import Speak from 'jaxcore-speak';
import {MonauralScope} from 'jaxcore-client';

import en from "jaxcore-speak/voices/en/en.json";
import es from "jaxcore-speak/voices/es.json";
import fr from "jaxcore-speak/voices/fr.json";

global.Speak = Speak;

Speak.addLanguages(en, es, fr);

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
			text: ''
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
		
		const getTheme = function(color) {
			return {
				strokeColor : 'rgb('+colors[color]+')',
				clipColor : 'black',
				fillColor : 'rgba('+colors[color]+',0.2)',
				dotColor : 'rgb('+colors[color]+')',
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
		
		this.voices = {
			Jack: new Speak({language: 'en', profile: 'Jack', visualizer: this.scopes.red}),
			Roy: new Speak({language: 'en', profile: 'Roy', visualizer: this.scopes.yellow}),
			Leon: new Speak({language: 'es', profile: 'Leon', visualizer: this.scopes.green}),
			Cylon: new Speak({language: 'en', profile: 'Cylon', visualizer: this.scopes.cyan}),
			Zhora: new Speak({language: 'fr', profile: 'Zhora', visualizer: this.scopes.blue}),
			Robo: new Speak({profile: 'Robo', visualizer: this.scopes.purple})
		};
		
		// speakVoice.setVisualizer(this.monoScope);
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
						<div className="speakername">Cylon</div>
						<canvas ref={this.cyanRef} width="100" height="100"/>
					</div>
					<div id="blue">
						<div className="speakername">Zhora</div>
						<canvas ref={this.blueRef} width="100" height="100"/>
					</div>
					<div id="purple">
						<div className="speakername">Robo</div>
						<canvas ref={this.purpleRef} width="100" height="100"/>
					</div>
					
				</div>
				
				<div id="controls">
					
					<button onClick={e => this.introduceYourselves()}>Introduce Yourselves</button>
					
				</div>
			</div>
		);
	}
	
	introduceYourselves() {
		// this.voices.Jack.speak("hello, i am jack");
		// this.voices.Roy.speak("roy, at your service");
		// this.voices.Leon.speak("hola, mi nombre es leon");
		// this.voices.Cylon.speak("we are the cylon");
		// this.voices.Zhora.speak("bonjour je m'appelle zhora");
		this.voices.Robo.speak("greetings, i am robo");
	}
	
}

export default MultipleSpeakersApp;
