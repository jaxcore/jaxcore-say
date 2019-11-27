import React, {Component} from 'react';
import Say from 'jaxcore-say';
import async from 'async';

Say.setWorkers({
	'espeak': 'webworkers/espeak-all-worker.js',
	'sam': 'webworkers/sam-worker.js'
});

var jack = new Say({
	language: 'en',
	profile: 'Jack'
});

class SayApp extends Component {
	constructor() {
		super();
		
		this.state = {
			isSpeaking: false
		};
		
		this.inputRef = React.createRef();
	}
	
	render() {
		return (
			<div>
				<h3>Basic Say Example</h3>
				
				<div>
					<input ref={this.inputRef} size="40" placeholder="Type something then press Enter" defaultValue="we are borg. resistance is futile. your technological and biological distinctiveness will be added to our own. we are borg. resistance is futile. your technological and biological distinctiveness will be added to our own. we are borg. resistance is futile. your technological and biological distinctiveness will be added to our own"/>
					<button onClick={e => this.sayText()}>Say</button>
				</div>
				
				<br/>
				
				<div>Is Speaking : {this.state.isSpeaking? 'YES':'NO'}</div>
			</div>
		);
	}
	
	sayText() {
		const text = this.inputRef.current.value;
		this.setState({
			isSpeaking: true
		}, () => {
			
			console.log('Borg: started');
			
			let voices = [];
			
			voices.push(function(callback) {
				jack.getWorkerAudioData(text, {
					profile: 'Jack',
					speed: 160,
					pitch: 10,
				}, function(audioContext, source) {
					callback(null, [audioContext, source]);
				})
			});
			
			voices.push(function(callback) {
				jack.getWorkerAudioData(text, {
					profile: 'Zhora',
					speed: 160,
					pitch: 60
				}, function(audioContext, source) {
					callback(null, [audioContext, source]);
				})
			});

			voices.push(function(callback) {
				jack.getWorkerAudioData(text, {
					profile: 'Roy',
					speed: 160,
					pitch: 70
				}, function(audioContext, source) {
					callback(null, [audioContext, source]);
				})
			});
			
			voices.push(function(callback) {
				jack.getWorkerAudioData(text, {
					profile: 'Pris',
					speed: 159,
					pitch: 60
				}, function(audioContext, source) {
					callback(null, [audioContext, source]);
				})
			});
			
			voices.push(function(callback) {
				jack.getWorkerAudioData(text, {
					profile: 'Cylon',
					speed: 170,
					pitch: 25
				}, function(audioContext, source) {
					callback(null, [audioContext, source]);
				})
			});
			
			voices.push(function(callback) {
				jack.getWorkerAudioData(text, {
					profile: 'Xenu',
					speed: 170,
					pitch: 33
				}, function(audioContext, source) {
					callback(null, [audioContext, source]);
				})
			});
			
			async.parallel(voices, function(err, results) {
				if (results) {
					results.forEach(function(result) {
						let audioContext = result[0];
						let source = result[1];
						source.connect(audioContext.destination);
						source.onended = function () {
							source.connect(audioContext.destination);
							audioContext.close();
							// resolve();
						};
						source.start(0);
					});
					console.log(results);
				}
			});
			
		});
	}
}

export default SayApp;
