import { WriteBetter } from './model';
import { IsEnabledOnDocs, Message } from './shared';

const onMessage = (msg: Message, _: chrome.runtime.MessageSender, callback: (response?: any) => void) => {
    console.debug('content-script received message: ', msg.type);
    if (msg.type === 'analyze_doc') {
        analyze();
        callback(true);
    }
}

const analyze = () => {
    let doc = WriteBetter.Doc.create();
    console.debug('doc info: ', doc, doc.getSuggestions());
    doc.propagateSuggestions();
}

chrome.runtime.onMessage.addListener(onMessage);

// Run the script once added to the doc and user enabled it.
IsEnabledOnDocs(isEnabled => {
    if (isEnabled) {
        analyze();
    }
})