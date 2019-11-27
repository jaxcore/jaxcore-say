import React, {Component} from 'react';
import Say from 'jaxcore-say';


Say.setWorkers({
	'espeak': 'webworkers/espeak-all-worker.js',
	'sam': 'webworkers/sam-worker.js'
});

var say = new Say({
	language: 'en'
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
				<h3>Borg Text-to-Speech Example:</h3>
				
				<div>
					<form onSubmit={e => {
						e.preventDefault(); return false;
					}}>
						<input ref={this.inputRef} size="70" placeholder="Type something then press Enter"
							   defaultValue="we are borg... resistance is futile.... your technological and biological distinctiveness will be added to our own"/>
						<button onClick={e => this.sayText()}>Say</button>
					</form>
				</div>
				
				<br/>
				
				<div>Are the Borg Speaking? {this.state.isSpeaking ? 'YES' : 'NO'}</div>
			</div>
		);
	}
	
	sayText() {
		const text = this.inputRef.current.value;
		this.setState({
			isSpeaking: true
		}, () => {
			
			console.log('Borg: started');
			
			say.say(text, {profile: 'Borg'}).then(() => {
				this.setState({
					isSpeaking: false
				});
			})
			
		});
	}
}

export default SayApp;
