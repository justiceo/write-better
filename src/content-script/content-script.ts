import { Model } from './model';
import { Style } from './style';
import { Log } from '../shared/log';
import { Message } from '../shared/shared';

const TAG = "content-script.ts"
let resizeTask: any = null;

const analyze = () => {
    const t1 = performance.now();
    new Model.Doc().propagateSuggestions();
    Log.debug(TAG, "Analyzed doc in ", performance.now() - t1, "ms");
}

const init = () => {
    // Automatically re-analyze doc every second.
    // TODO: needs a ways to stop this when plugin is disabled (though disabling not part of v1.).
    setInterval(analyze, 1000);

    // When window is resized, force re-analyze doc. clear caches how?
    window.addEventListener('resize', () => {
        if (resizeTask !== null) {
            window.clearTimeout(resizeTask);
        }

        resizeTask = setTimeout(() => {
            resizeTask = null;
            analyze();
        }, 1000);
    });
}

const onMessage = (msg: Message, _: chrome.runtime.MessageSender, callback: (response?: any) => void) => {
    console.debug('content-script received message: ', msg.type);
    if (msg.type === 'analyze_doc') {
        init();
        callback(true);
    } else if (msg.type === 'cleanup') {
        Style.getInstance().clear();
        window.removeEventListener('resize', resizeTask);
    }
}

chrome.runtime.onMessage.addListener(onMessage);

// Run the script once added to the doc and user enabled it.
init();