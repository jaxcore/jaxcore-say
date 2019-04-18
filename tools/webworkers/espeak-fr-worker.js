import meSpeak from '../../lib/mespeak';
import mespeakConfig from '../../lib/mespeak/mespeak_config.json';
meSpeak.loadConfig(mespeakConfig);
import lang from "../../voices/fr.json";
meSpeak.loadVoice(lang);
self.meSpeak = meSpeak;