import EventEmitter from 'events';
import async from 'async';
import SayQueue from './queue';
import profiles from './profiles';
import MonauralScope from './monauralscope';

function getAudioContext() {
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
	return audioContext;
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
	'ca': 'Catalan',
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

class Say extends EventEmitter {
	
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
		this.lang = Say.getLanguageId(lang);
	}
	
	processOptions(options) {
		if (!options) {
			options = {};
		}
		
		let profileName = (options.profile) ? options.profile : this.defaultProfile;
		
		const profile = this.profiles[profileName]['default'];
		
		
		var v = Object.assign({}, profile);
		
		if (options.slow) v.speed = this.profiles[profileName]['slow'].speed;
		if (options.fast) v.speed = this.profiles[profileName]['fast'].speed;
		if (options.low) v.pitch = this.profiles[profileName]['low'].pitch;
		if (options.high) v.pitch = this.profiles[profileName]['high'].pitch;
		
		// if (options.pitch) v.pitch = this.profiles[profileName]['pitch'].pitch;
		if (options.pitch) v.pitch = options.pitch;
		// if (options.speed) v.speed = this.profiles[profileName]['speed'].speed;
		if (options.speed) v.speed = options.speed;
		
		if (options.language) {
			v.voice = Say.getLanguageId(options.language);
		}
		else {
			v.voice = this.lang;
		}
		
		if (options.delay) {
			v.delay = options.delay;
		}
		
		return v;
	}
	
	say(text, options) {
		options = options || {};
		
		if (this.visualizer) {
			return new Promise((resolve) => {
				this.getWorkerAudioData(text, options, (audioContext, source) => {
					this.visualizer.loadAudioData(audioContext, source, resolve);
				});
			});
		}
		else {
			return new Promise((resolve) => {
				this.getWorkerAudioData(text, options, (audioContext, source) => {
					// this.visualizer.loadAudioData(audioContext, source, resolve);
					if (options.profile === 'Borg') {
						let audioBuffer = source.buffer;
						
						// attempt to mitigate audio click/pops at the end of the clip using a gain node
						
						var gainNode = audioContext.createGain();
						gainNode.gain.setValueAtTime(1, 0);
						gainNode.gain.setValueAtTime(1, audioBuffer.duration-0.5);
						gainNode.gain.linearRampToValueAtTime(0.0001, audioBuffer.duration - 0.2);
						source.connect(gainNode);
						gainNode.connect(audioContext.destination);
						
						let didexit = false;
						setTimeout(function() {
							if (!didexit) {
								didexit = true;
								// stopping early seems to help with click/pops as well
								source.stop();
								audioContext.close();
								resolve();
							}
						}, audioBuffer.duration * 1000 - 200); // stop 0.1s early
						
						source.onended = function () {
							if (!didexit) {
								didexit = true;
								audioContext.close();
								resolve();
							}
						};
						
						source.start(0);
					}
					else {
						source.connect(audioContext.destination);
						source.onended = function () {
							// source.disconnect(audioContext.destination);
							audioContext.close();
							resolve();
						};
						source.start(0);
					}
				});
			});
		}
	}
	
	getWorkerAudioData(text, options, callback) {
		text = text.toLowerCase();
		if (!options) options = {};
		let profileName = options.profile || this.defaultProfile;
		
		if (profileName === 'Borg') {
			this.borgGetAudioData(text, callback);
		}
		else {
			if (!profileName) profileName = 'Jack';
			let profile = this.profiles[profileName];
			if (!profile) {
				throw new Error('no profile: ' + profileName);
			}
			let engine = profile.engine;
			
			let workerPath;
			
			if (engine === 'sam') {
				workerPath = Say.workers.sam;
			}
			else if (engine === 'espeak') {
				if (typeof Say.workers.espeak === 'string') {
					workerPath = Say.workers.espeak;
				}
				else if (Say.workers.espeak.length) {
					let lang = options.language;
					if (lang.startsWith('en-')) {
						lang = 'en/' + l;
					}
					for (let i = 0; i < Say.workers.espeak.length; i++) {
						if (Say.workers.espeak[i].language === lang) {
							workerPath = Say.workers.espeak[i].path;
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
					
					const data = e.data.rawdata;
					
					if (options.rawAudioData) {
						callback(data);
					}
					else {
						if (engine === 'sam') {
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
							audioContext.decodeAudioData(data, (buffer) => {
								source.buffer = buffer;
								
								// console.log('returning espeak');
								callback(audioContext, source);
								
							}, function (e) {
								console.log('error', e);
							});
						}
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
		let profileTypes = ['high', 'low', 'fast', 'slow'];
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
	
	borgGetAudioData(text, callback) {
		text += '....'; // add some silence to the end
		let voices = [];
		// let options;
		
		let audioContext = getAudioContext();
		
		voices.push((callback) => {
			this.getWorkerAudioData(text, {
				profile: 'Jack',
				speed: 160,
				pitch: 1,
				rawAudioData: true
			}, function (data) {
				audioContext.decodeAudioData(data, (buffer) => {
					callback(null, [data, buffer]);
				});
			})
		});
		
		voices.push((callback) => {
			this.getWorkerAudioData(text, {
				profile: 'Jack',
				speed: 160,
				pitch: 50,
				rawAudioData: true
			}, function (data) {
				audioContext.decodeAudioData(data, (buffer) => {
					callback(null, [data, buffer]);
				});
			})
		});
		
		voices.push((callback) => {
			this.getWorkerAudioData(text, {
				profile: 'Zhora',
				speed: 160,
				pitch: 40,
				rawAudioData: true
			}, function (data) {
				audioContext.decodeAudioData(data, (buffer) => {
					callback(null, [data, buffer]);
				});
			});
		});
		
		voices.push((callback) => {
			this.getWorkerAudioData(text, {
				profile: 'Roy',
				speed: 160,
				pitch: 40,
				rawAudioData: true
			}, function (data) {
				audioContext.decodeAudioData(data, (buffer) => {
					callback(null, [data, buffer]);
				});
			});
		});
		
		voices.push((callback) => {
			this.getWorkerAudioData(text, {
				profile: 'Leon',
				speed: 160,
				pitch: 25,
				rawAudioData: true
			}, function (data) {
				audioContext.decodeAudioData(data, (buffer) => {
					callback(null, [data, buffer]);
				});
			})
		});
		
		voices.push((callback) => {
			this.getWorkerAudioData(text, {
				profile: 'Xenu',
				speed: 164,
				pitch: 10,
				rawAudioData: true
			}, function (data) {
				audioContext.decodeAudioData(data, (buffer) => {
					callback(null, [data, buffer]);
				});
			});
		});
		
		async.parallel(voices, function (err, results) {
			if (results) {
				
				// debugger;
				let maxLength = 0;
				let maxDuration = 0;
				let sampleRate = 0;
				results.forEach(function (result) {
					let data = result[0];
					let buffer = result[1];
					// var audioBuffer = data.createBuffer(2); //, maxLength, 48000);
					maxLength = Math.max(maxLength, buffer.length);
					maxDuration = Math.max(maxDuration, buffer.duration);
					sampleRate = buffer.sampleRate;
				});
				
				
				let audioContext = getAudioContext();
				// let audioBuffer = audioContext.createBuffer(2, maxLength, 48000);
				let audioBuffer = audioContext.createBuffer(2, sampleRate * maxDuration, sampleRate);
				
				// var leftBuffer = audioBuffer.getChannelData(0);
				// var rightBuffer = audioBuffer.getChannelData(1);
				
				let channgelToggle = false;
				results.forEach(function (result) {
					let data = result[0];
					let buffer = result[1];
					// debugger;
					
					if (channgelToggle) {
						var leftInBuffer = buffer.getChannelData(0);
						var leftOutBuffer = audioBuffer.getChannelData(0);
						
						// let count = 0;
						for (let i = 0; i < maxLength; i++) {
							if (i > leftOutBuffer.length) leftOutBuffer[i] = 0;
							leftOutBuffer[i] += leftInBuffer[i];
							// count++;
						}
					}
					else {
						var rightInBuffer = buffer.getChannelData(0);
						var rightOutBuffer = audioBuffer.getChannelData(1);
						
						// let count = 0;
						for (let i = 0; i < maxLength; i++) {
							if (i > rightInBuffer.length) rightOutBuffer[i] = 0;
							else rightOutBuffer[i] += rightInBuffer[i];
							// count++;
						}
					}
					
					// console.log('count', count);
					
					channgelToggle = !channgelToggle;
					
					// debugger;
					
					// let audioContext = result[0];
					// let source = result[1];
					//
					// console.log('source', source);
					// debugger;
					
					// source.connect(audioContext.destination);
					// source.onended = function () {
					// 	source.connect(audioContext.destination);
					// 	audioContext.close();
					// };
					// source.start(0);
				});
				
				// let audioContext2 = getAudioContext();
				
				let source = audioContext.createBufferSource();
				source.buffer = audioBuffer;
				
				callback(audioContext, source);
				
				
			}
		});
	}
}

Say.variants = variants;
Say.profiles = profiles;
Say.languageIds = languageIds;

Say.getLanguageId = function (lang) {
	if (lang.indexOf('_') > -1) lang = lang.replace('_', '-');
	// if (lang === 'en-us') lang = 'en/en-us';
	// if (lang === 'en') lang = 'en/en';
	if (lang.startsWith('en') && lang.indexOf('/') === -1) lang = 'en/' + lang;
	return lang;
};

Say.addProfile = function (profile) {
	for (let name in profile) {
		Say.profiles[name] = profile[name];
	}
};

Say.setWorkers = function (workers) {
	Say.workers = workers;
};

const sayQueue = new SayQueue(new Say());
Say.queue = sayQueue.queue.bind(sayQueue);
Say.clearQueue = sayQueue.clearQueue.bind(sayQueue);
Say.on = sayQueue.on.bind(sayQueue);
Say.once = sayQueue.once.bind(sayQueue);

export default Say;

export {MonauralScope};

