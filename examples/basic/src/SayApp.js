import React, {Component} from 'react';
import Say from 'jaxcore-say';

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
					<input ref={this.inputRef} size="40" placeholder="Type something then press Enter" defaultValue="Hello World"/>
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
			console.log('Jack: started');
			jack.say(text).then(() => {
				console.log('Jack: stopped');
				this.setState({
					isSpeaking: false
				});
			});
			
		});
	}
}

export default SayApp;
