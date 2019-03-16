Jaxcore Speak
=======

![screenshot](https://raw.githubusercontent.com/jaxcore/jaxcore-speak/master/screenshot.png)

A JavaScript speech synthesis library based upon [meSpeak](http://www.masswerk.at/mespeak/) (an emscripten port of [espeak](http://espeak.sourceforge.net/)) and [sam-js](https://github.com/discordier/sam) (a reverse-engineered version of [Software Automatic Mouth](https://en.wikipedia.org/wiki/Software_Automatic_Mouth) for the Commodore 64).

Jaxcore Speak combines both speech synthesis systems through a common API with an HTML5 canvas-based audio volume display which was partially based on [volume-meter](https://github.com/cwilso/volume-meter).

### Demo

todo

### Installation

```
npm install jaxcore-speak
```

### Usage (NPM module)


```
import Speak from 'jaxcore-speak';
import en_us from "jaxcore-speak/voices/en/en-us.json";
Speak.addLanguages(en_us);
let voice = new Speak({
	profile: 'Cylon',
	language: 'en/en-us'
});
voice.speak('hello my name is Cylon');
```

### Predefined Voice Profiles

Jaxcore Speak includes the following predefined ESpeak-based voices:

*Jack
Pris
Roy
Xenu
Cylon
Leon
Rachel
Zhora*

And the following SAM-based voices:

*Sam
Elf
Robo
Granny*

Custom voices can be generated at run time.  See the source code of the [SpeakApp.js](examples/client/src/SpeakApp.js) example for details.

### Intonation

The voice profiles include an easy way to modify the voice to be faster, slower, deeper, higher:

```
voice.speak('hello world', {
    fast: true
});
```

```
voice.speak('hello world', {
    slow: true
});
```

```
voice.speak('hello world', {
    high: true
});
```

```
voice.speak('hello world', {
    low: true
});
```


#### ESpeak Languages

Languages must be loaded individually.  Due their file size it is recommended to only include the languages that are necessary.

```
import ca from "jaxcore-speak/voices/ca.json";
import cs from "jaxcore-speak/voices/cs.json";
import de from "jaxcore-speak/voices/de.json";
import en from "jaxcore-speak/voices/en/en.json";
import en_n from "jaxcore-speak/voices/en/en-n.json";
import en_rp from "jaxcore-speak/voices/en/en-rp.json";
import en_sc from "jaxcore-speak/voices/en/en-sc.json";
import en_us from "jaxcore-speak/voices/en/en-us.json";
import en_wm from "jaxcore-speak/voices/en/en-wm.json";
import el from "jaxcore-speak/voices/el.json";
import eo from "jaxcore-speak/voices/eo.json";
import es from "jaxcore-speak/voices/es.json";
import es_la from "jaxcore-speak/voices/es-la.json";
import fi from "jaxcore-speak/voices/fi.json";
import fr from "jaxcore-speak/voices/fr.json";
import hu from "jaxcore-speak/voices/hu.json";
import it from "jaxcore-speak/voices/it.json";
import kn from "jaxcore-speak/voices/kn.json";
import la from "jaxcore-speak/voices/la.json";
import lv from "jaxcore-speak/voices/lv.json";
import nl from "jaxcore-speak/voices/nl.json";
import pt from "jaxcore-speak/voices/pt.json";
import pt_pt from "jaxcore-speak/voices/pt-pt.json";
import ro from "jaxcore-speak/voices/ro.json";
import sk from "jaxcore-speak/voices/sk.json";
import sv from "jaxcore-speak/voices/sv.json";
import tr from "jaxcore-speak/voices/tr.json";
import zh from "jaxcore-speak/voices/zh.json";
import zh_yue from "jaxcore-speak/voices/zh-yue.json";
```

To add the language data use `Speak.addLanguages()`:

```
Speak.addLanguages(en);
Speak.addLanguages(es);
Speak.addLanguages(fr);
```

Set the desired language while instantiating the Speak object:

```
let voice = new Speak({
    profile: 'Cylon',
    language: 'en/en-us'
});
```

Or switch languages at any time:

```
voice.setLanguage('es');
```

### Scope Visualization

Install MonauralScope from jaxcore-client:

```
npm install jaxcore-client
```

```
import {MonauralScope} from 'jaxcore-client';
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

### Run Example Demo

Clone this repo, then:

```
cd examples/client
yarn install
yarn start
```


### LICENSE

Jaxcore Speak is free software released under the GPL License.

However, IANAL (I am not a lawyer) and due to the bizarre combination of dependencies and the typical use case of compilation/minification into a JavaScript file delivered over the web, the license restrictions are ambiguous.

### Original Works

meSpeak (NPM module by Mikola Lysenko):
[https://github.com/mikolalysenko/mespeak](https://github.com/mikolalysenko/mespeak)

meSpeak (emscriptem port by Norbert Landsteiner):
[https://www.masswerk.at/mespeak/](https://www.masswerk.at/mespeak/)

eSpeak [http://espeak.sourceforge.net/](http://espeak.sourceforge.net/)

SAM (reverse-engineered version of SAM by Sebastian Macke)
[https://github.com/s-macke/SAM](https://github.com/s-macke/SAM)

SAM fork by Vidar Hokstad
[https://github.com/vidarh/SAM](https://github.com/vidarh/SAM)

SAM-js port by Christian Schiffler
[https://github.com/discordier/sam](https://github.com/discordier/sam)


##### meSpeak License

Jaxcore speak includes modified source code from meSpeak which is GPL and also includes empscripten-compiled eSpeak code which is also GPL.  Therefore this derivative work is available under the GPL.

##### sam-js License

sam-js is used as an external dependency (via NPM) for the SAM based voice profiles.  sam-js was reverse engineered and could be classified as abadonware (quoted from [https://github.com/s-macke/SAM](https://github.com/s-macke/SAM)) :

```
The software is a reverse-engineered version of a software published more than 34 years ago by "Don't ask Software".

The company no longer exists. Any attempt to contact the original authors failed. Hence S.A.M. can be best described as Abandonware (http://en.wikipedia.org/wiki/Abandonware)

As long this is the case I cannot put my code under any specific open source software license. However the software might be used under the "Fair Use" act (https://en.wikipedia.org/wiki/FAIR_USE_Act) in the USA.
```

Jaxcore Speak will be updated according to any new information that comes to light and it is recommended that any further derivative works/improvement also be independently released under the GPL.