import React, {Component} from 'react';
import Speak from 'jaxcore-speak';
import {MonauralScope} from 'jaxcore-client';

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

global.Speak = Speak;

// Add a custom ESpeak voice
Speak.addProfile({
	"Custom Voice 1": {
		"name": "Custom Voice 1",
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
	"Custom Voice 2": {
		"name": "Custom Voice 2",
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

let speak = new Speak({
	language: 'en_us'
});
global.speak = speak;


// test generated code:
/*
import Speak from 'jaxcore-speak';
import en_us from "mespeak/voices/en/en-us.json";
Speak.addLanguages(en_us);
let voice = new Speak({
	profile: 'Cylon',
	language: 'es'
});
voice.speak('hola mi nombre es Cylon', {
	intonation: 'low'
});
*/


class SpeakApp extends Component {
	constructor() {
		super();
		
		this.canvasRef = React.createRef();
		
		this.state = {
			profile: 'Jack',
			intonation: 'default',
			text: '',
			language: 'en/en',
			languageEnabled: true,
			spoken: [
				{
					profile: 'Jack',
					intonation: 'default',
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
					<input size="40" placeholder="Type something then press Enter" onKeyUp={e => this.onKeyUp(e)}
						   onChange={e => this.onChangeText(e)} value={this.state.text}/>
					<button onClick={e => this.sayText()}>Speak</button>
				</div>
				
				<ul>
					{this.state.spoken.map((s, i) => {
						return (<li key={i}><a href="/" onClick={e => this.clickSpoken(e, i)}>{s.text}</a> ({s.profile} {s.intonation})</li>);
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
			intonation:o.intonation,
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
		}, () => {
			this.updateCode();
		});
	}
	
	renderProfileSelect() {
		let o = [];
		
		for (let p in speak.profiles) {
			o.push((<option key={p} value={p}>{p}</option>));
		}
		
		return (<select onChange={e => this.selectProfile(e)} value={this.state.profile}>
			{o}
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
		const intonation = this.state.intonation;
		const language = this.state.language;
		
		const saying = {
			text,
			intonation,
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
		if (this.audioContext) {
			console.log('context exists');
			return;
		}
		
		const saying = this.state.spoken[index];
		
		let replacements = [
			['Xenu', 'zee new']
		];
		
		const options = {
			profile: saying.profile,
			// intonation: saying.intonation,
			language: saying.language,
			replacements,
		};
		if (saying.intonation !== 'default') options[saying.intonation] = true;
		
		// this.monoScope.setTheme({
		// 	color: 'orange',
		// 	// clipColor: 'white',
		// 	// background: 'black'
		// });
		// speak.setVisualizer(this.monoScope);
		
		speak.getAudioData(saying.text, options, (audioContext, source) => {
			this.monoScope.loadAudioData(audioContext, source);
		});
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
		if (i === null) saying = this.state;
		else saying = this.state.spoken[i];
		
		const voice_id = Speak.getLanguageId(saying.language);
		const voice_uid = saying.language.replace('en/','').replace('-','_');
		
		let lang = '';
		let langimport = '';
		if (Speak.profiles[saying.profile].engine === 'espeak') {
			langimport = "import "+voice_uid+" from \"mespeak/voices/"+voice_id+".json\";\n" +
			"Speak.addLanguages("+voice_uid+");\n";
			lang = "\tlanguage: \"" + saying.language + "\"\n";
		}
		
		let s = "import Speak from \"jaxcore-speak\";\n" +
			langimport+
			"var voice = new Speak({\n" +
			"\tprofile: \""+saying.profile+"\",\n" +
			lang+
			"});\n";
		if (saying.intonation !== 'default') {
			const intonations = saying.intonation+": true";
			s += "voice.speak(\""+saying.text+"\", {\n" +
			"  " + intonations +"\n"+
			"});";
		}
		else {
			s += "voice.speak(\""+saying.text+"\");";
		}
		return s;
	}
}

export default SpeakApp;
