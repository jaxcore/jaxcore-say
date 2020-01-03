import meSpeak from '../../lib/mespeak';
import mespeakConfig from '../../lib/mespeak/mespeak_config.json';
meSpeak.loadConfig(mespeakConfig);

import ca from "../../voices/ca.json";
import cs from "../../voices/cs.json";
import de from "../../voices/de.json";
import en from "../../voices/en/en.json";
import en_n from "../../voices/en/en-n.json";
import en_rp from "../../voices/en/en-rp.json";
import en_sc from "../../voices/en/en-sc.json";
import en_us from "../../voices/en/en-us.json";
import en_wm from "../../voices/en/en-wm.json";
import el from "../../voices/el.json";
import eo from "../../voices/eo.json";
import es from "../../voices/es.json";
import es_la from "../../voices/es-la.json";
import fi from "../../voices/fi.json";
import fr from "../../voices/fr.json";
import hu from "../../voices/hu.json";
import it from "../../voices/it.json";
import kn from "../../voices/kn.json";
import la from "../../voices/la.json";
import lv from "../../voices/lv.json";
import nl from "../../voices/nl.json";
import pt from "../../voices/pt.json";
import pt_pt from "../../voices/pt-pt.json";
import ro from "../../voices/ro.json";
import sk from "../../voices/sk.json";
import sv from "../../voices/sv.json";
import tr from "../../voices/tr.json";
import zh from "../../voices/zh.json";
import zh_yue from "../../voices/zh-yue.json";

[ca, cs, de, en, en_n, en_rp, en_sc, en_us, en_wm, el, eo, es, es_la, fi, fr, hu, it, kn, la, lv, nl, pt, pt_pt, ro, sk, sv, tr, zh, zh_yue].forEach(function(lang) {
	meSpeak.loadVoice(lang);
});

global.meSpeak = meSpeak;