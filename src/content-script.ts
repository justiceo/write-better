import { WriteBetter } from './model';
import { WriteBetterUI } from './ui';
import { IsEnabledOnDocs, GetExtensionFile, Message } from './shared';

const onMessage = (msg: Message, _: chrome.runtime.MessageSender, callback: (response?: any) => void) => {
    console.debug('content-script received message: ', msg.type);
    if (msg.type === 'analyze_doc') {
        analyze();
        callback(true);
    } else if (msg.type === 'cleanup') {
        WriteBetterUI.Style.getInstance().clear();
        let doc = WriteBetter.Doc.getInstance();
        doc.visit<string>(WriteBetterUI.unregisterHandlers, []);
    }
}

const analyze = () => {
    GetExtensionFile('underline.css', (template: string) => {
        WriteBetterUI.Style.getInstance().setTemplate(template);
        let doc = WriteBetter.Doc.getInstance();
        console.debug('doc info: ', doc, doc.getSuggestions());
        doc.propagateSuggestions();
    });
}

chrome.runtime.onMessage.addListener(onMessage);

// Run the script once added to the doc and user enabled it.
IsEnabledOnDocs(isEnabled => {
    if (isEnabled) {
        analyze();
    }
})