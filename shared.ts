export class Message {
    type: 'analyze_doc';
    value: any;
}

const gDocsUrl = 'docs.google.com';

export const EnableOnDocs = (callback: () => void) => {
    let save: any = {}
    save[gDocsUrl] = true
    chrome.storage.sync.set(save, callback);
}

export const IsEnabledOnDocs = (callback: (isEnabled: boolean) => void) => {
    chrome.storage.sync.get(gDocsUrl, (data) => {
        console.log("is enabled on docs?", data);
        if (data[gDocsUrl]) {
            callback(true);
        } else {
            callback(false);
        }
    })
}