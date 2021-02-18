import { Log } from '../shared/log';
import { Message } from '../shared/shared';
import { WriteBetter } from './writebetter';

const TAG = "content-script.ts"
const writeBetter = new WriteBetter();

const init = () => {
    if (!writeBetter.isGoogleDocs()) {
        Log.debug(TAG, "Invalid editor model");
        return;
    }

    // TODO: needs a ways to stop this when plugin is disabled (though disabling not part of v1.).
    writeBetter.analyzeAndWatch('.kix-paginateddocumentplugin');
}

const onMessage = (msg: Message, _: chrome.runtime.MessageSender, callback: (response?: any) => void) => {
    console.debug('content-script received message: ', msg.type);
    if (msg.type === 'analyze_doc') {
        init();
        callback(true);
    } else if (msg.type === 'cleanup') {
        writeBetter.cleanup();
    }
}

chrome.runtime.onMessage.addListener(onMessage);

// Run the script once added to the doc and user enabled it.
init();