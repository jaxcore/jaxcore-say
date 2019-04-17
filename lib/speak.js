import EventEmitter from 'events';
import meSpeak from './mespeak';
import profiles from './profiles';
import mespeakConfig from './mespeak/mespeak_config.json';
import SamJs, {SamProcess, TextToPhonemes} from 'sam-js';

function SamData(text, options) {
	const input = TextToPhonemes(text);
	options = options || {};
	
	const data = SamProcess(input, options);
	const audiodata = new Float32Array(data.length);
	for(let i=0; i < data.length; i++) {
		audiodata[i] = (data[i] - 128) / 256;
	}
	return audiodata;
}

function SamPlay(text, options) {
	let context = new AudioContext();
	let data = SamData(text, options);
	
	// return new Promise(function (resolve) {
		var source = context.createBufferSource();
		var soundBuffer = context.createBuffer(1, data.length, 22050);
		var buffer = soundBuffer.getChannelData(0);
		for(var i=0; i<data.length; i++) {
			buffer[i] = data[i];
		}
		source.buffer = soundBuffer;
		source.connect(context.destination);
		source.onended = function () {
			// resolve(true);
			// if (callback) callback();
		};
		source.start(0);
	// });
}

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

const languageIds = {
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
		
		this.lang = null;
		this.profiles = {};
		this.defaultProfile = null;
		
		// this.speakQueue = [];
		
		for (let name in profiles) {
			this.addProfile(profiles[name]);
		}
		
		if (options.profile) {
			this.setProfile(options.profile);
		}
		else {
			this.setProfile('Jack');
		}
		
		if (this.profile.engine === 'espeak') {
			if (options.language) {
				this.setLanguage(options.language);
			}
		}
		if (!this.lang) {
			this.setLanguage('en_us');
		}
		
		if (options.visualizer) {
			this.setVisualizer(options.visualizer);
		}
	}
	
	setVisualizer(vis) {
		this.visualizer = vis;
	}
	
	setLanguage(lang) {
		this.lang = Speak.getLanguageId(lang);
	}
	
	processOptions(options) {
		if (!options) {
			options = {};
		}
		
		let profileName = (options.profile)? options.profile : this.defaultProfile;
		
		const profile = this.profiles[profileName]['default'];
		
		var v = Object.assign({}, profile);
		
		if (options.slow) v.speed = this.profiles[profileName]['slow'].speed;
		if (options.fast) v.speed = this.profiles[profileName]['fast'].speed;
		if (options.low) v.pitch = this.profiles[profileName]['low'].pitch;
		if (options.high) v.pitch = this.profiles[profileName]['high'].pitch;
		if (options.pitch) v.pitch = this.profiles[profileName]['pitch'].pitch;
		if (options.speed) v.speed = this.profiles[profileName]['speed'].speed;
		
		if (options.language) {
			v.voice = Speak.getLanguageId(options.language);
		}
		else {
			v.voice = this.lang;
		}
		
		if (options.delay) {
			v.delay = options.delay;
		}
		
		return v;
	}
	
	// todo:
	// queue(text, options, callback) {
		// this.speakQueue.push([text, options, callback]);
		// debugger;
		// if (!this.playing);
	// }
	
	speak(text, options) {
		options = options || {};
		if (this.visualizer) {
			return new Promise((resolve) => {
				this.getAudioData(text, options, (audioContext, source) => {
					this.visualizer.loadAudioData(audioContext, source, resolve);
				});
			});
		}
		else {
			return new Promise((resolve) => {
				if (options.replacements) text = this.replacementsFor(text, options.replacements);
				let profileName = options.profile || this.defaultProfile;
				let profile = this.profiles[profileName];
				if (profile.engine === 'sam') {
					SamPlay(text, options).then(() => {
						resolve();
					})
				} else {
					const v = this.processOptions(options);
					meSpeak.speak(text, v, resolve);
				}
			});
		}
	}
	
	getAudioData(text, options, callback) {
		let audioContext = new AudioContext();
		let source = audioContext.createBufferSource();
		
		let engine;
		if (options.profile) {
			engine = this.profiles[options.profile].engine;
		}
		else {
			options.profile = this.defaultProfile;
			engine = this.profiles[this.defaultProfile].engine;
		}
		
		if (engine === 'sam') {
			if (options.replacements) text = this.replacementsFor(text, options.replacements);
			const samOptions = Object.assign({}, this.profiles[options.profile]['default']);
			
			if (options.fast) samOptions.speed = this.profiles[options.profile].fast.speed;
			if (options.slow) samOptions.speed = this.profiles[options.profile].slow.speed;
			if (options.high) samOptions.pitch = this.profiles[options.profile].high.pitch;
			if (options.low) samOptions.pitch = this.profiles[options.profile].low.pitch;
			if (options.pitch) samOptions.pitch = this.profiles[options.profile].pitch;
			if (options.speed) samOptions.speed = this.profiles[options.profile].speed;
			let data = SamData(text, samOptions);
			// return new Promise(function (resolve) {
			var audioBuffer = audioContext.createBuffer(1, data.length, 22050);
			var buffer = audioBuffer.getChannelData(0);
			for(let i=0; i<data.length; i++) {
				buffer[i] = data[i];
			}
			source.buffer = audioBuffer;
			if (callback) callback(audioContext, source);
		}
		else {
			
			const data = this.raw(text, options);
			audioContext.decodeAudioData(data, (buffer) => {
				source.buffer = buffer;
				if (callback) callback(audioContext, source);
			}, function(e) {
				console.log('error', e);
			});
		}
	}
	
	replacementsFor(text, replacements) {
		replacements.forEach(function (replacement) {
			let from = replacement[0];
			let to = replacement[1];
			text = text.replace(new RegExp(from, 'gi'), to);
		});
		return text;
	}
	
	raw(text, options) {
		if (options.replacements) text = this.replacementsFor(text, options.replacements);
		const v = this.processOptions(options);
		v.rawdata = 'raw';
		return meSpeak.speak(text, v);
	}
	
	// todo:
	multipartData() {
		var parts = [
			{ text: "Travel to",      voice: "en/en-us", variant: "m3" },
			{ text: "Paris",          voice: "fr",       variant: "f5" },
			{ text: "at light speed", voice: "en/en-us", variant: "m3" }
		];
		// todo: there's a bug in meSpeak npm module due to missing global reference to meSpeak
		global.meSpeak = meSpeak;
		meSpeak.speakMultipart(parts);
	}
	
	addProfile(profile) {
		let profileTypes = ['high','low','fast','slow'];
		profileTypes.forEach(type => {
			if (type !== 'default' && type !== 'name') {
				var p = Object.assign({}, profile['default']);
				for (let i in profile[type]) {
					p[i] = profile[type][i];
				}
				profile[type] = p;
			}
		});
		this.profiles[profile.name] = profile;
	}
	
	setProfile(name) {
		this.defaultProfile = name;
		this.profile = profiles[name];
		return this;
	}
}

Speak.meSpeak = meSpeak;
Speak.SamJs = SamJs;
Speak.variants = variants;
Speak.profiles = profiles;
Speak.languageIds = languageIds;
Speak.languages = {};

Speak.getLanguageId = function(lang) {
	if (lang.indexOf('_')>-1) lang = lang.replace('_','-');
	if (lang === 'en-us') lang = 'en/en-us';
	if (lang === 'en') lang = 'en/en';
	return lang;
};

Speak.addLanguages = function() {
	let language, id;
	for (let i=0;i<arguments.length;i++) {
		language = arguments[i];
		if ('voice_id' in language) {
			id = language.voice_id;
			if (id in languageIds) {
				Speak.languages[id] = language;
				meSpeak.loadVoice(language);
			} else {
				console.log('Speak: invalid language', id);
			}
		}
	}
};

Speak.addProfile = function(profile) {
	for (let name in profile) {
		Speak.profiles[name] = profile[name];
	}
};

export default Speak;
