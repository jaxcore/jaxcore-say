import EventEmitter from 'events';
import meSpeak from 'mespeak';
import profiles from './profiles';

const variants = [
	'f1',
	'f2',
	'f3',
	'f4',
	'f5',
	
	'm1',
	'm2',
	'm3',
	'm4',
	'm5',
	'm6',
	'm7',
	
	'croak',
	'klatt',
	'klatt2',
	'klatt3',
	'whisper',
	'whisperf'
];

class Speak extends EventEmitter {
	
	constructor(path, languages) {
		super();
		
		this.path = path || 'mespeak';
		meSpeak.loadConfig(path + "/mespeak_config.json");
		
		if (!languages) languages = ['en'];
		
		this.languages = languages;
		this.lang = {};
		this.profiles = {};
		this.defaultProfile = null;
		this.voiceVolume = 1;
		
		languages.forEach((lang) => {
			console.log('load', lang);
			this.loadLanguage(lang);
		});
		
		for (let name in profiles) {
			this.addProfile(profiles[name]);
		}
	}
	
	loadLanguage(lang) {
		meSpeak.loadVoice(this.path + "/voices/en/en.json", () => {
			console.log('StoryTeller: '+ lang + 'loaded');
			this.lang[lang] = true;
			if (this.checkReady()) {
				this.emit('ready');
			}
		});
	}
	
	checkReady() {
		for (let i=0; i<this.languages.length;i++) {
			if (!this.lang[this.languages[i]]) return false;
		}
		return true;
	}
	
	speak(text, options) {
		if (!options) options = {};
		var voice = (options && options.voice)? options.voice : this.defaultProfile['default'];
		var delay = (options && options.delay)? options.delay : null; //debugger;
		
		var v = Object.assign({}, voice, {
			amplitude: voice.amplitude * this.voiceVolume
		});
		if (delay) {
			setTimeout(function () {
				meSpeak.speak(text, v);
			}, delay);
		}
		else {
			meSpeak.speak(text, v);
		}
		return this;
		
	}
	
	say(text, options) {
		let voice;
		if (!options) options = {};
		
		if (options.phonetic) {
			options.phonetic.forEach(function (replacement) {
				let from = replacement[0];
				let to = replacement[1];
				text = text.replace(new RegExp(from, 'g'), to);
			});
		}
		
		if (options.intonate) {
			if (options.intonate === 'd' || options.intonate === 'default') voice = this.getVoice('default');
			if (options.intonate === 'l' || options.intonate === 'low') {
				voice = this.getVoice('low');
			}
			if (options.intonate === 'h' || options.intonate === 'high') voice = this.getVoice('high');
			if (options.intonate === 'f' || options.intonate === 'fast') voice = this.getVoice('fast');
			if (options.intonate === 's' || options.intonate === 'slow') voice = this.getVoice('slow');
		}
		else voice = this.getVoice('default');
		
		options.voice = voice;
		
		this.speak(text, options);
		
		return this;
	}
	
	getVoice(type) {
		return this.profile[type];
	}
	
	addProfile(profile, isDefault) {
		let hasProfile = false;
		for (let i in this.profiles) {
			hasProfile = true;
			break;
		}
		
		// if (type !== 'default') {
		// 	var p = Object.assign({}, profile['default'], this.profiles[profile.name]);
		// 	this.profiles[profile.name] = p;
		//
		// }
		for (var type in profile) {
			if (type !== 'default' && type !== 'name') {
				var p = Object.assign({}, profile['default']);
				for (let i in profile[type]) {
					p[i] = profile[type][i];
				}
				profile[type] = p;
			}
		}
		
		this.profiles[profile.name] = profile;
		
		if (isDefault || !hasProfile) {
			this.defaultProfile = profile;
			this.setProfile(profile.name);
		}
	}
	
	volume(v) {
		this.voiceVolume = v;
		return this;
	}
	
	setProfile(name) {
		this.selectedProfile = name;
		this.profile = this.profiles[name];
		return this;
	}
	
	inflect(text, intonation) {
		// 'dhl'
	}
	
	voice(v) {
		this.voice = v;
	}
	
	cancel() {
		
	}
}

Speak.meSpeak = meSpeak;
Speak.variants = variants;
Speak.profiles = profiles;

export default Speak;
