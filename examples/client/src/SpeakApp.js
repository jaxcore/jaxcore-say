import React, {Component} from 'react';
import Speak from 'jaxcore-speak';
import {MonauralScope} from 'jaxcore-client';
// import AudioScope from './AudioScope';

import ca from "mespeak/voices/ca.json";
import cs from "mespeak/voices/cs.json";
import de from "mespeak/voices/de.json";
import en from "mespeak/voices/en/en.json";
import en_n from "mespeak/voices/en/en-n.json";
import en_rp from "mespeak/voices/en/en-rp.json";
import en_sc from "mespeak/voices/en/en-sc.json";
import en_us from "mespeak/voices/en/en-us.json";
import en_wm from "mespeak/voices/en/en-wm.json";
import el from "mespeak/voices/el.json";
import eo from "mespeak/voices/eo.json";
import es from "mespeak/voices/es.json";
import es_la from "mespeak/voices/es-la.json";
import fi from "mespeak/voices/fi.json";
import fr from "mespeak/voices/fr.json";
import hu from "mespeak/voices/hu.json";
import it from "mespeak/voices/it.json";
import kn from "mespeak/voices/kn.json";
import la from "mespeak/voices/la.json";
import lv from "mespeak/voices/lv.json";
import nl from "mespeak/voices/nl.json";
import pt from "mespeak/voices/pt.json";
import pt_pt from "mespeak/voices/pt-pt.json";
import ro from "mespeak/voices/ro.json";
import sk from "mespeak/voices/sk.json";
import sv from "mespeak/voices/sv.json";
import tr from "mespeak/voices/tr.json";
import zh from "mespeak/voices/zh.json";
import zh_yue from "mespeak/voices/zh-yue.json";

let speak = new Speak({
	languages: [ca, cs, de, en, en_n, en_rp, en_sc, en_us, en_wm, el, eo, es, es_la, fi, fr, hu, it, kn, la, lv, nl, pt, pt_pt, ro, sk, sv, tr, zh, zh_yue]
});

//speak.setLanguage("en/en-us");

global.speak = speak;

class SpeakApp extends Component {
	constructor() {
		super();
		
		this.canvasRef = React.createRef();
		
		this.state = {
			language: 'en/en-us',
			voiceProfile: 'Jack',
			intonation: 'default',
			text: '',
			spoken: [
				{
					profile: 'Jack',
					intonation: 'default',
					text: 'Hello World',
					language: 'en/en-us'
				}
			]
		};
		
		global.app = this;
		
		
	}
	
	
	componentDidMount() {
		// this.scope = new AudioScope(this.canvasRef.current);
		this.monoScope = new MonauralScope(this.canvasRef.current);
	}
	
	render() {
		return (
			<div>
				
				<div>
					<canvas ref={this.canvasRef} width="300" height="300"/>
				</div>
				
				<div>
					Voice Profile: {this.renderProfileSelect()}
				</div>
				<div>
					Intonation: {this.renderIntonationSelect()}
				</div>
				<div>
					Language: {this.renderLanguageSelect()}
				</div>
				
				<div>
					<input size="40" placeholder="Type something then press Enter" onKeyDown={e => this.onKeyDown(e)}
						   onChange={e => this.onChangeText(e)} value={this.state.text}/>
				</div>
				
				{/*<button onClick={e=>this.sayText()}>Speak</button>*/}
				
				<ul>
					{this.state.spoken.map((s, i) => {
						return (<li key={i}><a href="/" onClick={e => this.clickSpoken(e, i)}>{s.text}</a></li>);
					})}
				</ul>
				
				<div>
					<button onClick={e => this.playAll()}>Play All (Multipart)</button>
					<button onClick={e => this.clear()}>Clear</button>
				</div>
			
			</div>
		);
	}
	
	playAll() {
	
	}
	
	clear(e) {
		this.setState({
			spoken: []
		})
	}
	
	clickSpoken(e, i) {
		e.preventDefault();
		this.sayIndex(i);
	}
	
	onKeyDown(e) {
		if (e.keyCode === 13) { // Enter
			e.preventDefault();
			this.sayText();
			return;
		}
		console.log('keydown', e);
		
	}
	
	renderLanguageSelect() {
		
		const o = speak.languages.map((lang, i) => {
			return (<option key={i} value={lang}>{speak.getLanguageName(lang)}</option>);
		});
		
		return (<select onChange={e => this.selectLanguage(e)} value={this.state.language}>
			{o}
		</select>);
	}
	
	selectLanguage(e) {
		let language = e.target.options[e.target.selectedIndex].value;
		this.setState({
			language
		});
	}
	
	renderIntonationSelect() {
		return (<select onChange={e => this.selectIntonation(e)} value={this.state.intonation}>
			<option value="default">default</option>
			<option value="low">low</option>
			<option value="high">high</option>
			<option value="fast">fast</option>
			<option value="slow">slow</option>
		</select>);
	}
	
	selectIntonation(e) {
		let intonation = e.target.options[e.target.selectedIndex].value;
		this.setState({
			intonation
		});
	}
	
	renderProfileSelect() {
		let o = [];
		
		for (let p in speak.profiles) {
			o.push((<option key={p} value={p}>{p}</option>));
		}
		
		return (<select onChange={e => this.selectProfile(e)} value={this.state.voiceProfile}>
			{o}
		</select>);
	}
	
	selectProfile(e) {
		let voiceProfile = e.target.options[e.target.selectedIndex].value;
		this.setState({
			voiceProfile
		});
		
	}
	
	sayText() {
		const text = this.state.text;
		if (text.length === 0) return;
		
		const profile = this.state.voiceProfile;
		const intonation = this.state.intonation;
		const language = this.state.language;
		
		const saying = {
			text,
			intonation,
			language,
			profile
		};
		
		const spoken = this.state.spoken;
		const spokenIndex = this.state.spoken.length;
		spoken.push(saying);
		
		this.setState({
			spoken,
			text: ''
		});
		
		this.sayIndex(spokenIndex);
	}
	
	getBuffer(data, callback) {
		let audioContext = new AudioContext();
		let source = audioContext.createBufferSource();
		audioContext.decodeAudioData(data, (buffer) => {
			source.buffer = buffer;
			callback(audioContext, source);
		}, function(e) {
			console.log('error', e);
		});
	}
	
	sayIndex(index) {
		if (this.audioContext) {
			console.log('context exists');
			return;
		}
		
		const saying = this.state.spoken[index];
		// speak.speak(saying.text, {
		// 	profile: saying.profile,
		// 	intonation: saying.intonation,
		// 	language: saying.language
		// });
		
		const data = speak.raw(saying.text, {
			profile: saying.profile,
			intonation: saying.intonation,
			language: saying.language
		});
		
		// this.getBuffer(data, (audioContext, source) => {
		
		speak.getAudioData(saying.text, {
			profile: saying.profile,
			intonation: saying.intonation,
			language: saying.language
		}, (audioContext, source) => {
			
			// const dataR = speak.raw(saying.text, {
			// 	profile: 'Cylon',
			// 	intonation: saying.intonation,
			// 	language: saying.language
			// });
			//
			// this.getBuffer(dataR, (audioContextR, sourceR) => {
			//
			// 	this.scope.loadAudioData(audioContext, source);
			//
			// });
			
			// this.scope.once('destroy', () => {
			// 	/*delete src.buffer;
			// 	delete me.source;
			// 	delete me.audioContext;*/
			// });
			
			// this.scope.loadAudioData(audioContext, source);
			// this.scope.play();
			
			
			this.monoScope.loadAudioData(audioContext, source);
			
			
			
			// debugger;
			//debugger;
		});
		
		
		
		
		//
		// this.audioContext = new AudioContext();
		// const audioCtx = this.audioContext;
		// this.source = this.audioContext.createBufferSource();
		// const src = this.source;
		//
		// //alert('diconnect / reconnect not working');
		//
		// // this.scope = new AudioScope(this.canvasRef.current);
		//
		// const me = this;
		// audioCtx.decodeAudioData(data, function(buffer) {
		// 	src.buffer = buffer;
		//
		// 	me.scope.on('destroy', () => {
		// 		delete src.buffer;
		// 		delete me.source;
		// 		delete me.audioContext;
		// 	});
		//
		// 	me.scope.loadAudioData(audioCtx, src, buffer);
		//
		// 	me.scope.play(); //.start(0);
		// }, function(e) {
		// 	console.log('error', e);
		// });
		
		// this.source.buffer = data;
		// this.source.connect(this.context.destination);
		// debugger;
		// this.source.start(0);
		
		
	}
	
	// say(text) {
	//   speak.setLanguage(this.state.language);
	//   speak.setProfile(this.state.voiceProfile);
	//   speak.say(text, {
	//     intonation: this.state.intonation
	//   });
	// }
	
	onChangeText(e) {
		this.setState({
			text: e.target.value
		});
	}
}

export default SpeakApp;
