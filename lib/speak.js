import EventEmitter from 'events';

import SpeakerQueue from './queue';
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

class Speak extends EventEmitter {
	
	constructor(options) {
		super();
		if (!options) options = {};
		
		this.lang = null;
		this.profiles = {};
		this.defaultProfile = null;
		
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
	
	speak(text, options) {
		options = options || {};
		
		if (this.visualizer) {
			return new Promise((resolve) => {
				this.getWorkerAudioData(text, options, (audioContext, source) => {
					this.visualizer.loadAudioData(audioContext, source, resolve);
				});
			});
		}
		else {
			this.getWorkerAudioData(text, options, (audioContext, source) => {
				// this.visualizer.loadAudioData(audioContext, source, resolve);
				source.connect(audioContext.destination);
				source.onended = function () {
					source.connect(audioContext.destination);
					audioContext.close();
					if (callback) callback();
				};
				source.start(0);
			});
		}
	}
	
	getWorkerAudioData(text, options, callback) {
		text = text.toLowerCase();
		if (!options.profile) options.profile = ( this.defaultProfile || 'Jack');
		let engine = this.profiles[options.profile].engine;
		
		let workerPath;
		if (engine === 'sam') {
			workerPath = Speak.workers.sam;
		}
		else if (engine === 'espeak') {
			if (typeof Speak.workers.espeak === 'string') {
				workerPath = Speak.workers.espeak;
			}
			else if (Speak.workers.espeak.length) {
				let lang = options.language;
				if (lang.startsWith('en-')) {
					lang = 'en/'+l;
				}
				for (let i = 0; i < Speak.workers.espeak.length; i++) {
					if (Speak.workers.espeak[i].language === lang) {
						workerPath = Speak.workers.espeak[i].path;
						break;
					}
				}
			}
		}
		if (!workerPath) throw new Error('no worker path for this language');
		
		var worker = new Worker(workerPath);
		
		worker.addEventListener('message', (e) => {
			console.log('received from worker:', e.data);
			if (e.data.rawdata) {
				
				let audioContext;
				if (window.AudioContext) {
					audioContext = new window.AudioContext();
				}
				else if (window.webkitAudioContext) {
					console.log('creating webkitAudioContext');
					audioContext = new window.webkitAudioContext();
				}
				else {
					throw new Error('no AudioContext');
					return;
				}
				
				// if (!audioContext) {
				// 	console.log('no audioContext');
				// 	audioContext = new window.webkitAudioContext();
				// }
				if (!audioContext) {
					console.log('no audioContext 2');
					debugger;
					return;
				}
				if (!audioContext.createBufferSource) {
					console.log('no createBufferSource');
					debugger;
					return;
				}
				let source = audioContext.createBufferSource();
				
				if (engine === 'sam') {
					const data = e.data.rawdata;
					var audioBuffer = audioContext.createBuffer(1, data.length, 22050);
					var buffer = audioBuffer.getChannelData(0);
					for (let i = 0; i < data.length; i++) {
						buffer[i] = data[i];
					}
					source.buffer = audioBuffer;
					
					console.log('returning sam');
					callback(audioContext, source);
				}
				else {
					audioContext.decodeAudioData(e.data.rawdata, (buffer) => {
						source.buffer = buffer;
						
						console.log('returning espeak');
						callback(audioContext, source);
						
					}, function (e) {
						console.log('error', e);
					});
				}
			}
		}, false);
		
		let voptions = this.processOptions(options);
		
		worker.postMessage({
			cmd: 'speak',
			text,
			options: voptions
		});
	}
	
	replacementsFor(text, replacements) {
		replacements.forEach(function (replacement) {
			let from = replacement[0];
			let to = replacement[1];
			text = text.replace(new RegExp(from, 'gi'), to);
		});
		return text;
	}
	
	// todo:
	// multipartData() {
	// 	var parts = [
	// 		{ text: "Travel to",      voice: "en/en-us", variant: "m3" },
	// 		{ text: "Paris",          voice: "fr",       variant: "f5" },
	// 		{ text: "at light speed", voice: "en/en-us", variant: "m3" }
	// 	];
	// }
	
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

Speak.variants = variants;
Speak.profiles = profiles;
Speak.languageIds = languageIds;

Speak.getLanguageId = function(lang) {
	if (lang.indexOf('_')>-1) lang = lang.replace('_','-');
	// if (lang === 'en-us') lang = 'en/en-us';
	// if (lang === 'en') lang = 'en/en';
	if (lang.startsWith('en') && lang.indexOf('/')===-1) lang = 'en/' + lang;
	return lang;
};

Speak.addProfile = function(profile) {
	for (let name in profile) {
		Speak.profiles[name] = profile[name];
	}
};

Speak.setWorkers = function(workers) {
	Speak.workers = workers;
};

const speakerQueue = new SpeakerQueue(new Speak());
Speak.queue = speakerQueue.queue.bind(speakerQueue);
Speak.clearQueue = speakerQueue.clearQueue.bind(speakerQueue);
Speak.on = speakerQueue.on.bind(speakerQueue);
Speak.once = speakerQueue.once.bind(speakerQueue);

export default Speak;
