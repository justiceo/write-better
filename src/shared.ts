export class Message {
    type: 'analyze_doc';
    value: any;
}

const gDocsUrl = 'docs.google.com';
const templateCSS = 'template.css';

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

export const GetTemplateCSS = (callback: (template: string) => void) => {
    chrome.storage.sync.get(templateCSS, (data) => {
        if (data[templateCSS]) {
            callback(data[templateCSS]);
        } else {
            console.log("need to load template.css from local file");
            callback('');
        }
    });
}