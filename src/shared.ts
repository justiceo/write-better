export class Message {
    type: 'analyze_doc' | 'cleanup';
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
        if (data[gDocsUrl]) {
            callback(true);
        } else {
            callback(false);
        }
    })
}

export const LoadExtensionFile = (fileName: string, callback: (fileContents: string) => void) => {
    const readFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = function (e) { // "this" is reader.onloadend.
            callback(this.result as string);
        };
        reader.readAsText(file);
    }
    const readFileEntry = (e: FileEntry) => e.file(readFile);
    const readDirEntry = (dirEntry: DirectoryEntry) => dirEntry.getFile(fileName, {}, readFileEntry);
    chrome.runtime.getPackageDirectoryEntry(readDirEntry);
}

export const GetExtensionFile = (fileName: string, callback: (template: string) => void) => {
    chrome.storage.sync.get(fileName, (data) => {
        if (data[fileName]) {
            callback(data[fileName]);
        } else {
            LoadExtensionFile(fileName, (content: string) => {
                let save: any = {}
                save[fileName] = content
                chrome.storage.sync.set(save, () => callback(content));
            })
        }
    });
}