(this["webpackJsonpjaxcore-say-borg-example"]=this["webpackJsonpjaxcore-say-borg-example"]||[]).push([[0],{10:function(e,t,i){e.exports=i(22)},14:function(e,t,i){e.exports=i(21)},19:function(e,t,i){},21:function(e,t,i){"use strict";i.r(t);var a=i(0),n=i.n(a),o=i(12),r=i.n(o),s=(i(19),i(1)),l=i(2),h=i(4),c=i(3),u=i(5),d=i(10),p=i.n(d);p.a.setWorkers({espeak:"webworkers/espeak-all-worker.js",sam:"webworkers/sam-worker.js"});var f=new p.a({language:"en"}),g=function(e){function t(){var e;return Object(s.a)(this,t),(e=Object(h.a)(this,Object(c.a)(t).call(this))).state={isSpeaking:!1},e.inputRef=n.a.createRef(),e}return Object(u.a)(t,e),Object(l.a)(t,[{key:"render",value:function(){var e=this;return n.a.createElement("div",null,n.a.createElement("h3",null,"Borg Text-to-Speech Example:"),n.a.createElement("div",null,n.a.createElement("form",{onSubmit:function(e){return e.preventDefault(),!1}},n.a.createElement("input",{ref:this.inputRef,size:"70",placeholder:"Type something then press Enter",defaultValue:"we are borg... resistance is futile.... your technological and biological distinctiveness will be added to our own"}),n.a.createElement("button",{onClick:function(t){return e.sayText()}},"Say"))),n.a.createElement("br",null),n.a.createElement("div",null,"Are the Borg Speaking? ",this.state.isSpeaking?"YES":"NO"))}},{key:"sayText",value:function(){var e=this,t=this.inputRef.current.value;this.setState({isSpeaking:!0},(function(){console.log("Borg: started"),f.say(t,{profile:"Borg"}).then((function(){e.setState({isSpeaking:!1})}))}))}}]),t}(a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));r.a.render(n.a.createElement(g,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))},22:function(e,t,i){"use strict";i.r(t);var a=i(1),n=i(2),o=i(4),r=i(3),s=i(5),h=i(7),c=i.n(h),u=i(13),d=function(e){function t(e){var i;return Object(a.a)(this,t),(i=Object(o.a)(this,Object(r.a)(t).call(this)))._queue=[],i.speaker=e,i}return Object(s.a)(t,e),Object(n.a)(t,[{key:"clearQueue",value:function(){this._queue=[]}},{key:"queue",value:function(e){this._queue.push(e),this._speakNext()}},{key:"_speakNext",value:function(){var e=this;if(!this.isSpeaking){var t=this._queue.shift();t?(this.isSpeaking=!0,this.speaker.getWorkerAudioData(t.text,t.options,(function(i,a){t.onStart&&t.onStart(t),t.scope.loadAudioData(i,a,(function(){t.onStop&&setTimeout((function(){t.onStop(t)}),1),e._onEnded()}))}))):this.emit("finish")}}},{key:"_onEnded",value:function(){this.isSpeaking=!1,this._speakNext()}}]),t}(c.a),p=i(8),f=i.n(p),g=i(9),w=function(e){function t(e,i){var n;return Object(a.a)(this,t),i||(i={}),(n=Object(o.a)(this,Object(r.a)(t).call(this))).canvas=e,n.width=n.canvas.width,n.height=n.canvas.height,n.audioContext=null,n.meter=null,n.mediaStreamSource=null,n._draw=n.draw.bind(Object(g.a)(n)),n.isRecording=!1,n.setTheme({lineWidth:i.lineWidth||3,strokeColor:i.strokeColor||"#FF0000",clipColor:i.clipColor||i.strokeColor||"#FF0000",fillColor:i.fillColor||"rgba(255,0,0,0.1)",bgOnColor:i.bgOnColor||null,bgOffColor:i.bgOffColor||null,dotColor:i.dotColor||"#FF0000",dotSize:i.dotSize||3,background:i.background||null}),n}return Object(s.a)(t,e),Object(n.a)(t,[{key:"setTheme",value:function(e){this.theme=e,this.draw()}},{key:"createAudioMeter",value:function(e,t,i,a){var n=e.createScriptProcessor(512);return n.onaudioprocess=function(e){for(var t,i=e.inputBuffer.getChannelData(0),a=i.length,n=0,o=0;o<a;o++)t=i[o],Math.abs(t)>=this.clipLevel&&(this.clipping=!0,this.lastClip=window.performance.now()),n+=t*t;var r=Math.sqrt(n/a);this.volume=Math.max(r,this.volume*this.averaging),this.maxVolume||(this.maxVolume=this.volume),this.maxVolume=Math.max(this.volume,this.maxVolume)},n.clipping=!1,n.lastClip=0,n.volume=0,n.clipLevel=t||.99,n.averaging=i||.97,n.clipLag=a||500,n.connect(e.destination),n.checkClipping=function(){return!!this.clipping&&(this.lastClip+this.clipLag<window.performance.now()&&(this.clipping=!1),this.clipping)},n.shutdown=function(){this.disconnect(),this.onaudioprocess=null},n}},{key:"setIsRecording",value:function(e){this.isRecording!==e?(this.isRecording=e,e?this.startRecording():this.stopRecording()):console.log("same")}},{key:"stopRecording",value:function(){this.isRecording&&(this.mediaStreamSource&&this.meter&&this.mediaStreamSource.disconnect(this.meter),this.meter&&this.meter.shutdown(),this.audioContext&&this.audioContext.close()),this.isRecording=!1,this.isDrawing=!1}},{key:"requestMic",value:function(){var e=this;this.startRecording((function(){e.stopRecording()}),(function(){e.stopRecording()}))}},{key:"startRecording",value:function(e,t){var i=this;if(this.isRecording)console.log("already recording");else{console.log("startRecording"),this.isRecording=!0;var a=new(window.AudioContext||window.webkitAudioContext);this.audioContext=a;var n=function(n){if(console.log("startRecording success"),i.audioContext)try{i.mediaStreamSource=a.createMediaStreamSource(n),i.meter=i.createAudioMeter(a),i.mediaStreamSource.connect(i.meter),i.startDrawing(),e&&e()}catch(o){t&&t()}},o=function(e){console.log("startRecording fail"),t&&t()};try{if(navigator.getUserMedia)navigator.getUserMedia({audio:{mandatory:{googEchoCancellation:"false",googAutoGainControl:"false",googNoiseSuppression:"false",googHighpassFilter:"false"},optional:[]}},n,o);else{if(!navigator.mediaDevices.getUserMedia)throw new Error("no getUserMedia");navigator.mediaDevices.getUserMedia({audio:{mandatory:{googEchoCancellation:"false",googAutoGainControl:"false",googNoiseSuppression:"false",googHighpassFilter:"false"},optional:[]}},n,o)}}catch(r){alert("getUserMedia threw exception :"+r)}}}},{key:"loadAudioData",value:function(e,t,i){var a=this;this.audioContext=e,this.source=t,t.connect(e.destination);var n=this.createAudioMeter(e);this.meter=n,t.connect(this.meter),t.onended=function(){a.isPlaying=!1,t.disconnect(),delete t.buffer,t.stop(),a.stopDrawing(),e.close(),i&&i()},this.isPlaying=!0,this.startDrawing(),t.start(0)}},{key:"startDrawing",value:function(){this.isDrawing=!0,this.draw()}},{key:"stopDrawing",value:function(){this.meter.volume=0,this.draw(),this.isDrawing=!1}},{key:"draw",value:function(){if(this.canvas){var e=this.canvas.getContext("2d");if(this.theme.background?(e.fillStyle=this.theme.background,e.fillRect(0,0,this.width,this.height)):e.clearRect(0,0,this.width,this.height),this.theme.bgOnColor||this.theme.bgOffColor){var t=Math.min(this.width,this.height)/2-e.lineWidth;e.beginPath(),e.arc(this.width/2,this.height/2,t,0,2*Math.PI,!1),e.fillStyle=this.isPlaying||this.isRecording?this.theme.bgOnColor:this.theme.bgOffColor,e.fill(),e.closePath()}if(e.lineWidth=this.theme.lineWidth,this.theme.dotSize){var i=this.theme.dotSize;e.beginPath(),e.arc(this.width/2,this.height/2,i,0,2*Math.PI,!1),e.fillStyle=this.theme.dotColor,e.fill(),e.closePath()}if(this.isRecording||this.isDrawing){if(!this.meter)return void console.error("no meter");e.strokeStyle=this.meter.checkClipping()?this.theme.clipColor:this.theme.strokeColor;var a=Math.min(this.width,this.height)/2-e.lineWidth,n=this.meter.volume*a*5;n>this.width/2-this.theme.lineWidth&&(n=this.width/2-this.theme.lineWidth),e.beginPath(),e.arc(this.width/2,this.height/2,n,0,2*Math.PI,!1),this.theme.fillColor&&(e.fillStyle=this.theme.fillColor,e.fill()),e.stroke(),e.closePath(),this.isDrawing&&window.requestAnimationFrame(this._draw)}else console.log("not drawing")}else console.log("no canvas")}}]),t}(c.a);function m(){var e;if(window.AudioContext)e=new window.AudioContext;else{if(!window.webkitAudioContext)throw new Error("no AudioContext");console.log("creating webkitAudioContext"),e=new window.webkitAudioContext}return e}i.d(t,"MonauralScope",(function(){return w}));var v=function(e){function t(e){var i;for(var n in Object(a.a)(this,t),e||(e={}),(i=Object(o.a)(this,Object(r.a)(t).call(this))).lang=null,i.profiles={},i.defaultProfile=null,f.a)i.addProfile(f.a[n]);return e.profile?i.setProfile(e.profile):i.setProfile("Jack"),"espeak"===i.profile.engine&&e.language&&i.setLanguage(e.language),i.lang||i.setLanguage("en_us"),e.visualizer&&i.setVisualizer(e.visualizer),i}return Object(s.a)(t,e),Object(n.a)(t,[{key:"setVisualizer",value:function(e){this.visualizer=e}},{key:"setLanguage",value:function(e){this.lang=t.getLanguageId(e)}},{key:"processOptions",value:function(e){e||(e={});var i=e.profile?e.profile:this.defaultProfile,a=this.profiles[i].default,n=Object.assign({},a);return e.slow&&(n.speed=this.profiles[i].slow.speed),e.fast&&(n.speed=this.profiles[i].fast.speed),e.low&&(n.pitch=this.profiles[i].low.pitch),e.high&&(n.pitch=this.profiles[i].high.pitch),e.pitch&&(n.pitch=e.pitch),e.speed&&(n.speed=e.speed),e.language?n.voice=t.getLanguageId(e.language):n.voice=this.lang,e.delay&&(n.delay=e.delay),n}},{key:"say",value:function(e,t){var i=this;return t=t||{},this.visualizer?new Promise((function(a){i.getWorkerAudioData(e,t,(function(e,t){i.visualizer.loadAudioData(e,t,a)}))})):new Promise((function(a){i.getWorkerAudioData(e,t,(function(e,i){if("Borg"===t.profile){var n=i.buffer,o=e.createGain();o.gain.setValueAtTime(1,0),o.gain.setValueAtTime(1,n.duration-.5),o.gain.linearRampToValueAtTime(1e-4,n.duration-.2),i.connect(o),o.connect(e.destination);var r=!1;setTimeout((function(){r||(r=!0,i.stop(),e.close(),a())}),1e3*n.duration-200),i.onended=function(){r||(r=!0,e.close(),a())},i.start(0)}else i.connect(e.destination),i.onended=function(){e.close(),a()},i.start(0)}))}))}},{key:"getWorkerAudioData",value:function(e,i,a){e=e.toLowerCase(),i||(i={});var n=i.profile||this.defaultProfile;if("Borg"===n)this.borgGetAudioData(e,a);else{n||(n="Jack");var o=this.profiles[n];if(!o)throw new Error("no profile: "+n);var r,s=o.engine;if("sam"===s)r=t.workers.sam;else if("espeak"===s)if("string"===typeof t.workers.espeak)r=t.workers.espeak;else if(t.workers.espeak.length){var h=i.language;h.startsWith("en-")&&(h="en/"+l);for(var c=0;c<t.workers.espeak.length;c++)if(t.workers.espeak[c].language===h){r=t.workers.espeak[c].path;break}}if(!r)throw new Error("no worker path for this language");var u=new Worker(r);u.addEventListener("message",(function(e){if(console.log("received from worker:",e.data),e.data.rawdata){var t;if(window.AudioContext)t=new window.AudioContext;else{if(!window.webkitAudioContext)throw new Error("no AudioContext");console.log("creating webkitAudioContext"),t=new window.webkitAudioContext}if(!t)return void console.log("no audioContext 2");if(!t.createBufferSource)return void console.log("no createBufferSource");var n=t.createBufferSource(),o=e.data.rawdata;if(i.rawAudioData)a(o);else if("sam"===s){for(var r=t.createBuffer(1,o.length,22050),l=r.getChannelData(0),h=0;h<o.length;h++)l[h]=o[h];n.buffer=r,console.log("returning sam"),a(t,n)}else t.decodeAudioData(o,(function(e){n.buffer=e,a(t,n)}),(function(e){console.log("error",e)}))}}),!1);var d=this.processOptions(i);u.postMessage({cmd:"speak",text:e,options:d})}}},{key:"replacementsFor",value:function(e,t){return t.forEach((function(t){var i=t[0],a=t[1];e=e.replace(new RegExp(i,"gi"),a)})),e}},{key:"addProfile",value:function(e){["high","low","fast","slow"].forEach((function(t){if("default"!==t&&"name"!==t){var i=Object.assign({},e.default);for(var a in e[t])i[a]=e[t][a];e[t]=i}})),this.profiles[e.name]=e}},{key:"setProfile",value:function(e){return this.defaultProfile=e,this.profile=f.a[e],this}},{key:"borgGetAudioData",value:function(e,t){var i=this;e+="....";var a=[],n=m();a.push((function(t){i.getWorkerAudioData(e,{profile:"Jack",speed:160,pitch:1,rawAudioData:!0},(function(e){n.decodeAudioData(e,(function(i){t(null,[e,i])}))}))})),a.push((function(t){i.getWorkerAudioData(e,{profile:"Jack",speed:160,pitch:50,rawAudioData:!0},(function(e){n.decodeAudioData(e,(function(i){t(null,[e,i])}))}))})),a.push((function(t){i.getWorkerAudioData(e,{profile:"Zhora",speed:160,pitch:40,rawAudioData:!0},(function(e){n.decodeAudioData(e,(function(i){t(null,[e,i])}))}))})),a.push((function(t){i.getWorkerAudioData(e,{profile:"Roy",speed:160,pitch:40,rawAudioData:!0},(function(e){n.decodeAudioData(e,(function(i){t(null,[e,i])}))}))})),a.push((function(t){i.getWorkerAudioData(e,{profile:"Leon",speed:160,pitch:25,rawAudioData:!0},(function(e){n.decodeAudioData(e,(function(i){t(null,[e,i])}))}))})),a.push((function(t){i.getWorkerAudioData(e,{profile:"Xenu",speed:164,pitch:10,rawAudioData:!0},(function(e){n.decodeAudioData(e,(function(i){t(null,[e,i])}))}))})),u.a.parallel(a,(function(e,i){if(i){var a=0,n=0,o=0;i.forEach((function(e){e[0];var t=e[1];a=Math.max(a,t.length),n=Math.max(n,t.duration),o=t.sampleRate}));var r=m(),s=r.createBuffer(2,o*n,o),l=!1;i.forEach((function(e){e[0];var t=e[1];if(l)for(var i=t.getChannelData(0),n=s.getChannelData(0),o=0;o<a;o++)o>n.length&&(n[o]=0),n[o]+=i[o];else for(var r=t.getChannelData(0),h=s.getChannelData(1),c=0;c<a;c++)c>r.length?h[c]=0:h[c]+=r[c];l=!l}));var h=r.createBufferSource();h.buffer=s,t(r,h)}}))}}]),t}(c.a);v.variants=["f1","f2","f3","f4","f5","m1","m2","m3","m4","m5","m6","m7","croak","klatt","klatt2","klatt3","whisper","whisperf"],v.profiles=f.a,v.languageIds={ca:"Catalan",cs:"Czech",de:"German",el:"Greek","en/en":"English","en/en-n":"English (N)","en/en-rp":"English (RP)","en/en-sc":"English (Scottish)","en/en-us":"English (US)","en/en-wm":"English (WM)",eo:"Esperanto",es:"Spanish","es-la":"Spanish (Latin America)",fi:"Finnish",fr:"French",hu:"Hungarian",it:"Italian",kn:"Kannada",la:"Latin",lv:"Latvian",nl:"Dutch",pl:"Polish",pt:"Portuguese (Brazil)","pt-pt":"Portuguese, European",ro:"Romanian",sk:"Slovak",sv:"Swedish",tr:"Turkish",zh:"Chinese (Mandarin)","zh-yue":"Chinese (Cantonese)"},v.getLanguageId=function(e){return e.indexOf("_")>-1&&(e=e.replace("_","-")),e.startsWith("en")&&-1===e.indexOf("/")&&(e="en/"+e),e},v.addProfile=function(e){for(var t in e)v.profiles[t]=e[t]},v.setWorkers=function(e){v.workers=e};var k=new d(new v);v.queue=k.queue.bind(k),v.clearQueue=k.clearQueue.bind(k),v.on=k.on.bind(k),v.once=k.once.bind(k);t.default=v},8:function(e,t){e.exports={Jack:{name:"Jack",engine:"espeak",default:{amplitude:100,wordgap:0,pitch:10,speed:180,variant:"m2"},high:{pitch:50},low:{pitch:0},slow:{speed:120},fast:{speed:250}},Pris:{name:"Pris",phoneticName:"Priss",engine:"espeak",default:{amplitude:100,wordgap:0,pitch:47,speed:130,variant:"f5"},high:{pitch:80},low:{pitch:20},slow:{speed:100},fast:{speed:200}},Roy:{name:"Roy",engine:"espeak",default:{amplitude:100,wordgap:0,pitch:35,speed:180,variant:"m1"},high:{pitch:3},low:{pitch:5},slow:{speed:100},fast:{speed:200}},Scotty:{name:"Scotty",engine:"espeak",default:{amplitude:100,wordgap:0,pitch:35,speed:200,variant:"m3"},high:{pitch:3},low:{pitch:5},slow:{speed:100},fast:{speed:230}},Xenu:{name:"Xenu",phoneticName:"zee-new",engine:"espeak",default:{amplitude:100,wordgap:1,pitch:35,speed:170,variant:"klatt3"},high:{pitch:65},low:{pitch:0},slow:{speed:100},fast:{speed:200}},Cylon:{name:"Cylon",engine:"espeak",default:{amplitude:100,wordgap:1,pitch:35,speed:170,variant:"whisperf"},high:{pitch:65,speed:150},low:{pitch:0,speed:140},slow:{pitch:20,speed:100,wordgap:1},fast:{speed:200,wordgap:0}},Leon:{name:"Leon",phoneticName:"Leeon",engine:"espeak",default:{amplitude:100,wordgap:0,pitch:40,speed:150,variant:"m7"},high:{pitch:55},low:{pitch:5},slow:{speed:100},fast:{speed:200}},Rachel:{name:"Rachel",engine:"espeak",default:{amplitude:100,wordgap:0,pitch:60,speed:150,variant:"f2"},high:{pitch:75},low:{pitch:40},slow:{speed:100},fast:{speed:200}},Zhora:{name:"Zhora",engine:"espeak",default:{amplitude:100,wordgap:0,pitch:60,speed:150,variant:"f4"},high:{pitch:75},low:{pitch:40},slow:{speed:100},fast:{speed:200}},Borg:{name:"Borg",engine:"espeak",default:{}},Sam:{name:"Sam",engine:"sam",default:{speed:64,pitch:64,throat:128,mouth:128},high:{pitch:50},low:{pitch:110},slow:{speed:100},fast:{speed:40}},Elf:{name:"Elf",engine:"sam",default:{speed:72,pitch:64,throat:110,mouth:160},high:{pitch:50},low:{pitch:110},slow:{speed:100},fast:{speed:40}},Robo:{name:"Robo",engine:"sam",default:{speed:82,pitch:60,throat:190,mouth:190},high:{pitch:40},low:{pitch:100},slow:{speed:120},fast:{speed:50}},Granny:{name:"Granny",engine:"sam",default:{speed:82,pitch:35,throat:145,mouth:145},high:{pitch:25},low:{pitch:120},slow:{speed:130},fast:{speed:40}}}}},[[14,1,2]]]);
//# sourceMappingURL=main.e8e77f8a.chunk.js.map