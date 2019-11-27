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
		let sayText;
		let autoplay = false;
		// the autoplay feature hides the url in base64 encoding (send friends the url)
		if (document.location.search.startsWith('?say=')) {
			sayText = atob(decodeURIComponent(document.location.search.substring('?say='.length)));
			autoplay = true;
		}
		else sayText = "we are borg... resistance is futile.... your technological and biological distinctiveness will be added to our own"
		
		this.state = {
			isSpeaking: false,
			sayText,
			autoplay
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
						
						{
							this.state.autoplay? '' : (<input ref={this.inputRef} size="70" placeholder="Type something then press Enter"
								   value={this.state.sayText} onChange={e => this.setState({sayText: e.target.value})}/>)
						}
						
						<button onClick={e => this.sayText()}>Say</button>
					</form>
				</div>
				
				<br/>
				
				<div>Are the Borg Speaking? {this.state.isSpeaking ? 'YES' : 'NO'}</div>
			</div>
		);
	}
	
	sayText() {
		const text = this.state.autoplay? this.state.sayText : this.inputRef.current.value;
		this.setState({
			isSpeaking: true,
			autoplay: false
		}, () => {
			
			let btext = window.btoa(text);
			window.history.pushState(null, null, '?say='+encodeURIComponent(btext));
			
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
