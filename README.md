Jaxcore Say
=======

![screenshot](https://raw.githubusercontent.com/jaxcore/jaxcore-say/master/screenshot.png)

A JavaScript speech synthesis and visualization system for the web, based upon [meSpeak](http://www.masswerk.at/mespeak/) and [sam-js](https://github.com/discordier/sam).

Jaxcore Say combines both speech synthesis systems through a common API with an HTML5 canvas-based audio volume display which was partially based on [volume-meter](https://github.com/cwilso/volume-meter).

Beware that web browsers are now disabling Web Audio API by default, so the first usage of Jaxcore Say must be called from a user action such as mouse click or keyboard action.


### Examples

- Basic example: [https://jaxcore.github.io/jaxcore-say/basic-example/](https://jaxcore.github.io/jaxcore-say/basic-example)
- Full example: [https://jaxcore.github.io/jaxcore-say/client-example/](https://jaxcore.github.io/jaxcore-say/full-example)
- Multiple voices & scopes: [https://jaxcore.github.io/jaxcore-say/multiplevoices-example/](https://jaxcore.github.io/jaxcore-say/multiplevoices-example)

### Installation (NPM module)

```
npm install jaxcore-say
```

### Usage

English `en` is the default, but see below for how other languages can be used.

```
import Speak from "jaxcore-say";

Say.setWorkers({
	'espeak': 'webworkers/espeak-en-worker.js',
	'sam': 'webworkers/sam-worker.js'
});

let voice = new Say({
	profile: "Cylon",
	language: "en"
});

voice.say("hello my name is Cylon").then(function() {
  console.log("done");
});
```

### Webworker Usage

As of version v0.0.4, both speech synthesizers are loaded with webworkers which drastically improve memory usage.  The webworker files can be downloaded [here](https://raw.githubusercontent.com/jaxcore/jaxcore-listen/master/dist/workers.tar.gz).  Or to build the worker files clone this repo and run `npm run build-workers`.

The worker js files must be served separately from the NPM module, and the path to the files must be set using the `Say.setWorkers()` method.

SAM is English only so there is only 1 webworker file for it.

But ESpeak has many language options. For English (US) only use this:

```
Say.setWorkers({
	'espeak': 'webworkers/espeak-en-worker.js',
	'sam': 'webworkers/sam-worker.js'
});
```

For other languages it likely will be better to use the `all` file:

```
Say.setWorkers({
	'espeak': 'webworkers/espeak-all-worker.js',
	'sam': 'webworkers/sam-worker.js'
});
```

Keep in mind, the file sizes of each worker is large.  English (US) is 1.7MB, and all the languages is 2.7MB.  Your webserver requires proper caching of the worker files.

### Voice Profiles

Jaxcore Say includes the following predefined ESpeak-based voices:

* Jack
* Pris
* Roy
* Scotty
* Xenu
* Cylon
* Leon
* Rachel
* Zhora

And the following SAM-based voices:

* Sam
* Elf
* Robo
* Granny

Custom voices can be generated at run time.  See the source code of [SayApp.js](examples/full-example/src/SayApp.js) example for details.

### Intonation

The voice profiles include an easy way to modify the speed (faster/slower) and pitch (deeper/higher):

```
voice.say('hello world', {
  fast: true
});
```

```
voice.say('hello world', {
  slow: true
});
```

```
voice.say('hello world', {
  high: true
});
```

```
voice.say('hello world', {
  low: true
});
```

#### ESpeak Languages

The language should be defined while instantiating `new Say()`, the possible languages are:

* ca = Catalan
* cs = Czech
* de = German
* el = Greek
* en = English
* en-n = English (N)
* en-rp = English (RP)
* en-sc = English (Scottish)
* en-us = English (US)
* en-wm = English (WM)
* eo = Esperanto
* es = Spanish
* es-la = Spanish (Latin America)
* fi = Finnish
* fr = French
* hu = Hungarian
* it = Italian
* kn = Kannada
* la = Latin
* lv = Latvian
* nl = Dutch
* pl = Polish
* pt = Portuguese (Brazil)
* pt-pt = Portuguese, European
* ro = Romanian
* sk = Slovak
* sv = Swedish
* tr = Turkish
* zh = Chinese (Mandarin)
* zh-yue = Chinese (Cantonese)

Set the desired language while instantiating the Speak object:

```
let voice = new Say({
	profile: "Cylon",
	language: "es"
});
voice.say("hola mi nombre es Cylon");
```

Or switch languages at any time:

```
voice.setLanguage("es");
```

Or set the language as a `say()` option:

```
voice.say("bonjour je m'appelle Cylon", {
  language: "fr"
});
```

But remember, if 

### Scope Visualization

```
import {MonauralScope} from 'jaxcore-say';
```

Include a canvas element somewhere in your page:
```
<canvas id="scope" />
```

And use the `setVisualizer()` method:

```
var canvasElement = document.getElementById('scope');
var monoScope = new MonauralScope(canvasElement);

voice.setVisualizer(this.monoScope);
```	

### Run examples locally:

Clone this repo, then:

```
cd examples/basic-example
npm install
npm start
```

### Build all examples

Clone this repo, then:

```
npm install
npm run build-all
cd docs
python -m SimpleHTTPServer
// load http://localhost:8000
```

## Speaker Queue

The Speaker Queue allows multiple Say instances (voices) to be queued up and played one by one and receive start/stop events for UI updates while that voice is speaking.

See the [multiplevoices](https://jaxcore.github.io/jaxcore-say/multiplevoices-example) for an example of this in action.

## License

Jaxcore Say is free software released under the GPL License.

However, IANAL (I am not a lawyer) and due to the bizarre combination of dependencies and the typical use case of compilation/minification into a JavaScript file delivered over the web, the license restrictions are ambiguous.

### Original Works

meSpeak (NPM module by Mikola Lysenko):
[https://github.com/mikolalysenko/mespeak](https://github.com/mikolalysenko/mespeak)

meSpeak (emscripten port by Norbert Landsteiner):
[https://www.masswerk.at/mespeak/](https://www.masswerk.at/mespeak/)

eSpeak [http://espeak.sourceforge.net/](http://espeak.sourceforge.net/)

SAM (reverse-engineered version of SAM by Sebastian Macke)
[https://github.com/s-macke/SAM](https://github.com/s-macke/SAM)

SAM fork by Vidar Hokstad
[https://github.com/vidarh/SAM](https://github.com/vidarh/SAM)

SAM-js port by Christian Schiffler
[https://github.com/discordier/sam](https://github.com/discordier/sam)


##### meSpeak License

Jaxcore Say includes modified source code from meSpeak which is GPL and also includes emscripten-compiled eSpeak code which is also GPL.  Therefore this derivative work is available under the GPL.

##### sam-js License

sam-js is used as an external dependency (via NPM) for the SAM based voice profiles.  sam-js was reverse engineered and could be classified as abadonware (quoted from [https://github.com/s-macke/SAM](https://github.com/s-macke/SAM)) :

```
The software is a reverse-engineered version of a software published more than 34 years ago by "Don't ask Software".

The company no longer exists. Any attempt to contact the original authors failed. Hence S.A.M. can be best described as Abandonware (http://en.wikipedia.org/wiki/Abandonware)

As long this is the case I cannot put my code under any specific open source software license. However the software might be used under the "Fair Use" act (https://en.wikipedia.org/wiki/FAIR_USE_Act) in the USA.
```

Jaxcore Say will be updated according to any new information that comes to light and it is recommended that any further derivative works/improvement also be independently released under the GPL.