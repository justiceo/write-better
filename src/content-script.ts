import { WriteBetter } from './model';
import { IsEnabledOnDocs, GetExtensionFile, Message } from './shared';

const onMessage = (msg: Message, _: chrome.runtime.MessageSender, callback: (response?: any) => void) => {
    console.debug('content-script received message: ', msg.type);
    if (msg.type === 'analyze_doc') {
        analyze();
        callback(true);
    } else if (msg.type === 'cleanup') {
        WriteBetter.Style.getInstance().clear();
        let doc = WriteBetter.Doc.getInstance();
        doc.visit<string>(WriteBetter.unregisterHandlers, []);
    }
}

const analyze = () => {
    GetExtensionFile('underline.css', (template: string) => {
        WriteBetter.Style.getInstance().setTemplate(template);
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