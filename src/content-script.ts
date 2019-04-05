import { WriteBetter } from './model';
import { WriteBetterUI } from './ui';
import { IsEnabledOnDocs, GetExtensionFile, Message } from './shared';

const onMessage = (msg: Message, _: chrome.runtime.MessageSender, callback: (response?: any) => void) => {
    console.debug('content-script received message: ', msg.type);
    if (msg.type === 'analyze_doc') {
        init();
        callback(true);
    } else if (msg.type === 'cleanup') {
        WriteBetterUI.Style.getInstance().clear();
        let doc = WriteBetter.Doc.getInstance();
        doc.visit<string>(WriteBetterUI.unregisterHandlers, []);
        window.removeEventListener('resize', resizeTask);
    }
}

let resizeTask: any = null;

const init = () => {
    analyze();
    // TODO: scroll event is not fired in docs, need to implement a watch on page's top position.
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
        const curr = WriteBetter.Doc.getInstance().getText();
        if(curr != prevContent) {
            console.log('content changed: re-analyzing doc.')
            prevContent = curr
            analyze();
        }
    }, 1000)
}

const analyze = () => {
    GetExtensionFile('underline.css', (template: string) => {
        WriteBetterUI.Style.getInstance().setTemplate(template);
        let doc = WriteBetter.Doc.getInstance();
        console.debug('doc info: ', doc, doc.getSuggestions());
        WriteBetter.propagateSuggestions(doc, doc.getSuggestions());
    });
}

chrome.runtime.onMessage.addListener(onMessage);

// Run the script once added to the doc and user enabled it.
IsEnabledOnDocs(isEnabled => {
    if (isEnabled) {
        init();
    }
})