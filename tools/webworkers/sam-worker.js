import {SamProcess, TextToPhonemes} from '../../node_modules/sam-js';
function SamData(text, options) {
	const input = TextToPhonemes(text);
	options = options || {};
	
	const data = SamProcess(input, options);
	const audiodata = new Float32Array(data.length);
	for(let i=0; i < data.length; i++) {
		audiodata[i] = (data[i] - 128) / 256;
	}
	
	// var audioContext = new AudioContext();
	// var audioBuffer = audioContext.createBuffer(1, data.length, 22050);
	// var buffer = audioBuffer.getChannelData(0);
	// for(let i=0; i<data.length; i++) {
	// 	buffer[i] = data[i];
	// }
	
	return audiodata;
}
self.SamData = SamData;