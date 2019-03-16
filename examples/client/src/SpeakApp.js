import React, {Component} from 'react';
import Speak from 'jaxcore-speak';
import {MonauralScope} from 'jaxcore-client';

import ca from "jaxcore-speak/voices/ca.json";
import cs from "jaxcore-speak/voices/cs.json";
import de from "jaxcore-speak/voices/de.json";
import en from "jaxcore-speak/voices/en/en.json";
import en_n from "jaxcore-speak/voices/en/en-n.json";
import en_rp from "jaxcore-speak/voices/en/en-rp.json";
import en_sc from "jaxcore-speak/voices/en/en-sc.json";
import en_us from "jaxcore-speak/voices/en/en-us.json";
import en_wm from "jaxcore-speak/voices/en/en-wm.json";
import el from "jaxcore-speak/voices/el.json";
import eo from "jaxcore-speak/voices/eo.json";
import es from "jaxcore-speak/voices/es.json";
import es_la from "jaxcore-speak/voices/es-la.json";
import fi from "jaxcore-speak/voices/fi.json";
import fr from "jaxcore-speak/voices/fr.json";
import hu from "jaxcore-speak/voices/hu.json";
import it from "jaxcore-speak/voices/it.json";
import kn from "jaxcore-speak/voices/kn.json";
import la from "jaxcore-speak/voices/la.json";
import lv from "jaxcore-speak/voices/lv.json";
import nl from "jaxcore-speak/voices/nl.json";
import pt from "jaxcore-speak/voices/pt.json";
import pt_pt from "jaxcore-speak/voices/pt-pt.json";
import ro from "jaxcore-speak/voices/ro.json";
import sk from "jaxcore-speak/voices/sk.json";
import sv from "jaxcore-speak/voices/sv.json";
import tr from "jaxcore-speak/voices/tr.json";
import zh from "jaxcore-speak/voices/zh.json";
import zh_yue from "jaxcore-speak/voices/zh-yue.json";

global.Speak = Speak;

// Add a custom ESpeak voice
Speak.addProfile({
	"Custom ESpeak Voice": {
		"name": "Custom ESpeak Voice",
		"engine": "espeak",
		"default": {
			amplitude: 100,
			wordgap: 1,
			pitch: 40,
			speed: 150,
			variant: 'm7'
		},
		"high": {
			pitch: 55
		},
		"low": {
			pitch: 5
		},
		"slow": {
			speed: 100
		},
		"fast": {
			speed: 200
		}
	}
});

// Add a custom SAM voice
// Note: in SAM the pitch and speed is inverted relative to ESpeak (eg. use higher pitch number for a deep voice)
Speak.addProfile({
	"Custom SAM Voice": {
		"name": "Custom SAM Voice",
		"engine": "sam",
		"default": {
			speed: 82,
			pitch: 72,
			throat: 110,
			mouth: 105
		},
		"high": {
			pitch: 50
		},
		"low": {
			pitch: 100
		},
		"slow": {
			speed: 130
		},
		"fast": {
			speed: 60
		}
	}
});

Speak.addLanguages(ca, cs, de, en, en_n, en_rp, en_sc, en_us, en_wm, el, eo, es, es_la, fi, fr, hu, it, kn, la, lv, nl, pt, pt_pt, ro, sk, sv, tr, zh, zh_yue);

var voice = new Speak({
	language: 'en_us'
});
global.voice = voice;


// test generated code:
/*
import Speak from 'jaxcore-speak';
import en_us from "jaxcore-speak/voices/en/en-us.json";
Speak.addLanguages(en_us);
let voice = new Speak({
	profile: 'Cylon',
	language: 'en/en-us'
});
voice.speak('hola mi nombre es Cylon', {
	low: true
});
*/


class SpeakApp extends Component {
	constructor() {
		super();
		
		this.canvasRef = React.createRef();
		
		this.state = {
			profile: 'Jack',
			speed: 'default',
			pitch: 'default',
			text: '',
			language: 'en/en',
			languageEnabled: true,
			spoken: [
				{
					profile: 'Jack',
					speed: 'default',
					pitch: 'default',
					text: 'Hello World',
					language: 'en/en-us'
				}
			],
			spokenIndex: null,
			code: '',
			viewCode: false
		};
		
		global.app = this;
	}
	
	componentDidMount() {
		this.updateCode();
		this.monoScope = new MonauralScope(this.canvasRef.current);
		voice.setVisualizer(this.monoScope);
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
					Speed: {this.renderSpeedSelect()}
				</div>
				<div>
					Pitch: {this.renderPitchSelect()}
				</div>
				<div>
					Language: {this.renderLanguageSelect()}
				</div>
				
				<div>
					<input size="40" placeholder="Type something then press Enter" onKeyUp={e => this.onKeyUp(e)}
						   onChange={e => this.onChangeText(e)} value={this.state.text}/>
					<button onClick={e => this.sayText()}>Speak</button>
				</div>
				
				<ul>
					{this.state.spoken.map((s, i) => {
						return (<li key={i}><a href="/" onClick={e => this.clickSpoken(e, i)}>{s.text}</a> ({s.profile} {s.speed} {s.pitch})</li>);
					})}
				</ul>
				
				<div>
					<button onClick={e => this.clear()}>Clear</button>
				</div>
				
				<br/>
				
				<div>
					<button onClick={e => this.setState({viewCode:!this.state.viewCode})}>
						{this.state.viewCode? 'Hide Code':'View Code'}
					</button>
				</div>
				{this.renderCode()}
			</div>
		);
	}
	
	renderCode() {
		if (this.state.viewCode) {
			return (<pre>{this.state.code}</pre>);
		}
	}
	
	clear(e) {
		this.setState({
			spoken: []
		})
	}
	
	clickSpoken(e, i) {
		e.preventDefault();
		const o = this.state.spoken[i];
		this.sayIndex(i);
		this.setState({
			text: o.text,
			profile: o.profile,
			speed: o.speed,
			pitch: o.pitch,
			language: o.language
		}, () => {
			this.updateCode(i);
		});
	}
	
	onKeyUp(e) {
		if (e.keyCode === 13) { // Enter
			e.preventDefault();
			this.sayText();
			return;
		}
		this.updateCode();
		console.log('keydown', e);
	}
	
	renderLanguageSelect() {
		if (this.state.languageEnabled) {
			const o = [];
			for (let lang in Speak.languages) {
				o.push(<option key={lang} value={lang}>{Speak.languageIds[lang]}</option>);
			}
			return (<select onChange={e => this.selectLanguage(e)} value={this.state.language}>
				{o}
			</select>);
		}
		else {
			return "none";
		}
	}
	
	selectLanguage(e) {
		let language = e.target.options[e.target.selectedIndex].value;
		this.setState({
			language
		}, () => {
			this.updateCode();
		});
	}
	
	updateCode(i) {
		if (typeof i === 'undefined') i = null;
		const code = this.generateCode(i);
		this.setState({
			code
		});
	}
	
	renderSpeedSelect() {
		return (<select onChange={e => this.selectSpeed(e)} value={this.state.speed}>
			<option value="default">default</option>
			<option value="fast">fast</option>
			<option value="slow">slow</option>
		</select>);
	}
	renderPitchSelect() {
		return (<select onChange={e => this.selectPitch(e)} value={this.state.pitch}>
			<option value="default">default</option>
			<option value="low">low</option>
			<option value="high">high</option>
		</select>);
	}
	
	selectPitch(e) {
		let pitch = e.target.options[e.target.selectedIndex].value;
		this.setState({
			pitch
		}, () => {
			this.updateCode();
		});
	}
	selectSpeed(e) {
		let speed = e.target.options[e.target.selectedIndex].value;
		this.setState({
			speed
		}, () => {
			this.updateCode();
		});
	}
	
	renderProfileSelect() {
		let espeak = [];
		for (let p in voice.profiles) {
			if (Speak.profiles[p].engine === 'espeak') {
				espeak.push((<option key={p} value={p}>{p}</option>));
			}
		}
		
		let sam = [];
		for (let p in voice.profiles) {
			if (Speak.profiles[p].engine === 'sam') {
				sam.push((<option key={p} value={p}>{p}</option>));
			}
		}
		
		return (<select onChange={e => this.selectProfile(e)} value={this.state.profile}>
			<optgroup label="- ESpeak Voices -">
				{espeak}
			</optgroup>
			<optgroup label="- SAM Voices -">
				{sam}
			</optgroup>
		</select>);
	}
	
	selectProfile(e) {
		const profile = e.target.options[e.target.selectedIndex].value;
		const languageEnabled = Speak.profiles[profile].engine === 'espeak';
		this.setState({
			profile,
			languageEnabled
		}, () => {
			this.updateCode();
		});
	}
	
	sayText() {
		const text = this.state.text;
		if (text.length === 0) return;
		
		const profile = this.state.profile;
		const speed = this.state.speed;
		const pitch = this.state.pitch;
		const language = this.state.language;
		
		const saying = {
			text,
			speed,
			pitch,
			language,
			profile
		};
		
		this.updateCode();
		
		const spoken = this.state.spoken;
		const spokenIndex = this.state.spoken.length;
		spoken.push(saying);
		
		this.setState({
			spoken,
			spokenIndex,
			text: ''
		});
		
		this.sayIndex(spokenIndex);
		
	}
	
	sayIndex(index) {
		const saying = this.state.spoken[index];
		
		let replacements = [];
		
		// this is so the names are pronounced properly (eg. Priss instead of Pris)
		if (Speak.profiles[saying.profile].phoneticName) {
			replacements.push([saying.profile, Speak.profiles[saying.profile].phoneticName]);
		}
		
		const options = {
			profile: saying.profile,
			language: saying.language,
			replacements,
		};
		if (saying.speed !== 'default') options[saying.speed] = true;
		if (saying.pitch !== 'default') options[saying.pitch] = true;
		
		this.colors = {
			Jack: '255,0,0',
			Pris: '255,255,0',
			Roy: '0,255,0',
			Xenu: '255,0,255',
			Cylon: '255,255,0',
			Leon: '128,0,0',
			Rachel: '128,128,0',
			Zhora: '0,128,0',
			Sam: '0,128,128',
			Elf: '128,0,128',
			Robo: '255,0,128',
			Granny: '255,128,0'
		};
		let color = this.colors[saying.profile] || '0,0,255';
		
		this.monoScope.theme.strokeColor = 'rgb('+color+')';
		this.monoScope.theme.clipColor = 'black';
		this.monoScope.theme.fillColor = 'rgba('+color+',0.2)';
		this.monoScope.theme.dotColor = 'rgb('+color+')';
		
		voice.speak(saying.text, options);
		
		
	}
	
	onChangeText(e) {
		this.setState({
			text: e.target.value
		}, () => {
			this.updateCode();
		});
	}
	
	generateCode(i) {
		let saying;
		if (i === null || this.state.spoken.length===0) saying = this.state;
		else saying = this.state.spoken[i];
		
		const voice_id = Speak.getLanguageId(saying.language);
		const voice_uid = saying.language.replace('en/','').replace('-','_');
		
		let custom = '';
		if (saying.profile === 'Custom ESpeak Voice') {
			custom = "Speak.addProfile({\n" +
				"\t\"Custom ESpeak Voice\": {\n" +
				"\t\t\"name\": \"Custom ESpeak Voice\",\n" +
				"\t\t\"engine\": \"espeak\",\n" +
				"\t\t\"default\": {\n" +
				"\t\t\tamplitude: 100,\n" +
				"\t\t\twordgap: 1,\n" +
				"\t\t\tpitch: 40,\n" +
				"\t\t\tspeed: 150,\n" +
				"\t\t\tvariant: 'm7'\n" +
				"\t\t},\n" +
				"\t\t\"high\": {\n" +
				"\t\t\tpitch: 55\n" +
				"\t\t},\n" +
				"\t\t\"low\": {\n" +
				"\t\t\tpitch: 5\n" +
				"\t\t},\n" +
				"\t\t\"slow\": {\n" +
				"\t\t\tspeed: 100\n" +
				"\t\t},\n" +
				"\t\t\"fast\": {\n" +
				"\t\t\tspeed: 200\n" +
				"\t\t}\n" +
				"\t}\n" +
				"});\n";
		}
		else if (saying.profile === 'Custom SAM Voice') {
			custom = "Speak.addProfile({\n" +
				"\t\"Custom SAM Voice\": {\n" +
				"\t\t\"name\": \"Custom SAM Voice\",\n" +
				"\t\t\"engine\": \"sam\",\n" +
				"\t\t\"default\": {\n" +
				"\t\t\tspeed: 82,\n" +
				"\t\t\tpitch: 72,\n" +
				"\t\t\tthroat: 110,\n" +
				"\t\t\tmouth: 105\n" +
				"\t\t},\n" +
				"\t\t\"high\": {\n" +
				"\t\t\tpitch: 50\n" +
				"\t\t},\n" +
				"\t\t\"low\": {\n" +
				"\t\t\tpitch: 100\n" +
				"\t\t},\n" +
				"\t\t\"slow\": {\n" +
				"\t\t\tspeed: 130\n" +
				"\t\t},\n" +
				"\t\t\"fast\": {\n" +
				"\t\t\tspeed: 60\n" +
				"\t\t}\n" +
				"\t}\n" +
				"});\n";
		}
		
		let lang = '';
		let langimport = '';
		if (Speak.profiles[saying.profile].engine === 'espeak') {
			langimport = "import "+voice_uid+" from \"jaxcore-speak/voices/"+voice_id+".json\";\n" +
			"Speak.addLanguages("+voice_uid+");\n";
			lang = "\tlanguage: \"" + saying.language + "\"\n";
		}
		
		let s = "import Speak from \"jaxcore-speak\";\n" +
			langimport+
			custom+
			"var voice = new Speak({\n" +
			"\tprofile: \""+saying.profile+"\",\n" +
			lang+
			"});\n";
		
		if (saying.speed === 'default' && saying.pitch === 'default') {
			s += "voice.speak(\""+saying.text+"\");";
		}
		else {
			let intonations = [];
			if (saying.speed !== 'default') intonations.push("  " + saying.speed+": true");
			if (saying.pitch !== 'default') intonations.push("  " + saying.pitch+": true");
			s += "voice.speak(\""+saying.text+"\", {\n" +
				intonations.join(",\n")+"\n"+
				"});";
		}
		
		return s;
	}
}

export default SpeakApp;
