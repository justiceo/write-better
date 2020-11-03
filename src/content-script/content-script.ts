import { WriteBetter } from './model';
import { WriteBetterUI } from './ui';
import { Log } from '../shared/log';
import { Message } from '../shared/shared';

const onMessage = (msg: Message, _: chrome.runtime.MessageSender, callback: (response?: any) => void) => {
    console.debug('content-script received message: ', msg.type);
    if (msg.type === 'analyze_doc') {
        init();
        callback(true);
    } else if (msg.type === 'cleanup') {
        WriteBetterUI.Style.getInstance().clear();
        window.removeEventListener('resize', resizeTask);
    }
}

let resizeTask: any = null;

const init = () => {
    analyze();
    window.addEventListener('resize', () => {
        if (resizeTask !== null) {
            window.clearTimeout(resizeTask);
        }

        resizeTask = setTimeout(() => {
            resizeTask = null;
            analyze();
        }, 1000);
    });

    // TODO: needs a ways to stop this when plugin is disabled (though disabling not part of v1.).
    let prevContent = '';
    setInterval(() => {
        const curr = new WriteBetter.Doc().getText();
        if (curr != prevContent) {
            Log.debug('contentscript.js', 'content changed: re-analyzing doc.')
            prevContent = curr
            analyze();
        }
    }, 1000)
}

const analyze = () => {
    new WriteBetter.Doc().propagateSuggestions();
}

chrome.runtime.onMessage.addListener(onMessage);

// Run the script once added to the doc and user enabled it.
init();