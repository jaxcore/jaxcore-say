import EventEmitter from 'events';
import meSpeak from 'mespeak';
import profiles from './profiles';
import mespeakConfig from 'mespeak/src/mespeak_config.json';

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

const languages = {
	'ca' :'Catalan',
	'cs': 'Czech',
	'de': 'German',
	'el': 'Greek',
	'en/en': 'English',
	'en/en-n': 'English (N)',
	'en/en-rp': 'English (RP)',
	'en/en-sc': 'English (Scottish)',
	'en/en-us': 'English (US)',
	'en/en-wm': 'English (WM)',
	'eo': 'Esperanto',
	'es': 'Spanish',
	'es-la': 'Spanish (Latin America)',
	'fi': 'Finnish',
	'fr': 'French',
	'hu': 'Hungarian',
	'it': 'Italian',
	'kn': 'Kannada',
	'la': 'Latin',
	'lv': 'Latvian',
	'nl': 'Dutch',
	'pl': 'Polish',
	'pt': 'Portuguese (Brazil)',
	'pt-pt': 'Portuguese, European',
	'ro': 'Romanian',
	'sk': 'Slovak',
	'sv': 'Swedish',
	'tr': 'Turkish',
	'zh': 'Chinese (Mandarin)',
	'zh-yue': 'Chinese (Cantonese)'
};

meSpeak.loadConfig(mespeakConfig);

class Speak extends EventEmitter {
	
	constructor(options) {
		super();
		
		this.lang = {};
		this.profiles = {};
		this.defaultProfile = null;
		this.voiceVolume = 1;
		
		this.languages = [];
		
		let id;
		if (options.language && options.language.voice_id) {
			id = options.language.voice_id;
			this.languages.push(id);
			meSpeak.loadVoice(options.language);
			this.setLanguage(id);
		}
		if (options.profile) {
			this.setProfile(options.profile);
		}
		else {
			this.setProfile('Jack');
		}
		if (options.languages && options.languages.length) {
			for (let i=0;i<options.languages.length;i++) {
				id = options.languages[i].voice_id;
				if (id && id in languages) {
					this.languages.push(id);
					meSpeak.loadVoice(options.languages[i]);
					if (i===0) {
						this.setLanguage(id);
					}
				}
				else {
					console.log('Speak: invalid language', l);
				}
			}
		}
		else {
			console.warn('Speak: no languages specified');
		}
		
		
		
		
		// languages.forEach((lang) => {
		// 	console.log('load', lang);
		// 	this.loadLanguage(lang);
		// });
		
		for (let name in profiles) {
			this.addProfile(profiles[name]);
		}
	}
	
	getLanguageName(lang) {
		return languages[lang];
	}
	
	setLanguage(lang) {
		if (lang === 'en-us') lang = 'en/en-us';
		if (lang === 'en') lang = 'en/en';
		this.lang = lang;

	}
	
	loadLanguage(lang) {
		// meSpeak.loadVoice(this.path + "/voices/"+lang+".json", () => {
		meSpeak.loadVoice(lang, () => {
			console.log('Speak: '+ lang + 'loaded');
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
	
	processOptions(options) {
		if (!options) {
			options = {};
		}
		
		let profileName = (options.profile)? options.profile : this.defaultProfile;
		
		//let profile = this.profiles[profileName];
		
		//const intonation = options.intonation || 'default';
		
		const profile = this.profiles[profileName]['default'];
		var v = Object.assign({}, profile, {
			amplitude: profile.amplitude * this.voiceVolume
		});
		
		if (options.slow) v.speed = this.profiles[profileName]['slow'].speed;
		if (options.fast) v.speed = this.profiles[profileName]['fast'].speed;
		if (options.low) v.pitch = this.profiles[profileName]['low'].pitch;
		if (options.high) v.pitch = this.profiles[profileName]['high'].pitch;
		
		// const profile = this.profiles[profileName][intonation];
		
		// var v = Object.assign({}, profile, {
		// 	amplitude: profile.amplitude * this.voiceVolume
		// });
		
		if (options.language) {
			v.voice = options.language;
		}
		else v.voice = this.lang;
		
		if (options.delay) {
			debugger;
			v.delay = options.delay;
		}
		
		return v;
	}
	
	speak(text, options) {
		const v = this.processOptions(options);
		
		if (v.delay) {
			setTimeout(function () {
				meSpeak.speak(text, v);
			}, v.delay);
		}
		else {
			meSpeak.speak(text, v);
		}
		return this;
	}
	
	getAudioData(text, options, callback) {
		const data = this.raw(text, options);
		let audioContext = new AudioContext();
		let source = audioContext.createBufferSource();
		audioContext.decodeAudioData(data, (buffer) => {
			source.buffer = buffer;
			callback(audioContext, source);
		}, function(e) {
			console.log('error', e);
		});
	}
	
	raw(text, options) {
		const v = this.processOptions(options);
		v.rawdata = 'raw';
		return meSpeak.speak(text, v);
	}
	
	// say(text, options) {
	// 	let profile;
	// 	if (!options) options = {};
	//
	// 	// if (options.profile) profile = options.profile;
	// 	// else profile = this.defaultProfile.name;
	// 	//
	// 	// debugger;
	//
	// 	// if (options.phonetic) {
	// 	// 	options.phonetic.forEach(function (replacement) {
	// 	// 		let from = replacement[0];
	// 	// 		let to = replacement[1];
	// 	// 		text = text.replace(new RegExp(from, 'g'), to);
	// 	// 	});
	// 	// }
	//
	// 	// if (options.intonation) {
	// 	// 	if (options.intonation === 'default') profile = this.getVoice('default');
	// 	// 	if (options.intonation === 'low') profile = this.getVoice('low');
	// 	// 	if (options.intonation === 'high') profile = this.getVoice('high');
	// 	// 	if (options.intonation === 'fast') profile = this.getVoice('fast');
	// 	// 	if (options.intonation === 'slow') profile = this.getVoice('slow');
	// 	// }
	// 	// else profile = this.getVoice('default');
	//
	// 	options
	//
	// 	this.speak(text, options);
	//
	// 	return this;
	// }
	
	getVoice(profile, type) {
		return this.profiles[profile][type];
	}
	
	addProfile(profile) {
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
		
		// if (hasProfile) {
		// 	this.setProfile(profile.name);
		// }
	}
	
	volume(v) {
		this.voiceVolume = v;
		return this;
	}
	
	setProfile(name) {
		this.defaultProfile = name;
		this.profile = profiles[name];
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
Speak.languages = languages;
Speak.profiles = profiles;

export default Speak;
