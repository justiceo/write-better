import { WriteBetter } from './model';

export class Message {
    type: 'analyze_doc';
    value: any;
}

chrome.runtime.onMessage.addListener((
    msg: Message,
    sender: chrome.runtime.MessageSender,
    callback: (response?: any) => void) => {
    console.log('runtime.onMessage fired', msg);
    if (msg.type === 'analyze_doc') {
        let doc = WriteBetter.Doc.create();
        console.log('doc info: ', doc, doc.getQuerySelector(), doc.getSuggestions());
        doc.propagateSuggestions();
        callback('success');
    }
});