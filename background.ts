import { WriteBetter } from './model';

function toggleIcon(tab: chrome.tabs.Tab) {
    if (!tab) {
        return console.error('toggleIcon: tab input cannot be falsy');
    }
    const host = (new URL(tab.url)).hostname;
    if (!host) {
        return console.error('toggleIcon: hostname must be a non-nil string');
    }

    chrome.storage.sync.get(host, (data) => {
        let save: any = {}
        save[host] = !data[host]
        chrome.storage.sync.set(save, () => {
            console.log('toggleIcon: updated', host, 'to', save);
            setTabState(tab);
        });
    });
};

function setTabState(tab: chrome.tabs.Tab) {
    if (!tab) {
        return console.error('setTabState: tab input cannot be falsy');
    }
    const host = (new URL(tab.url)).hostname;
    if (!host) {
        return console.error('setTabState: hostname must be a non-nil string');
    }
    chrome.storage.sync.get(host, (data) => {
        console.log('setTabState: state of', host, 'is', data[host])
        chrome.browserAction.setIcon({ path: data[host] ? 'enabled.png' : 'disabled.png' });
        if (data[host]) {
            injectCode(tab, () => {
                chrome.tabs.sendMessage(tab.id, { type: 'analyze_doc' } as WriteBetter.Message, (resp) => {
                    console.log('Done analyzing doc:', resp);
                });
            });
        }
    });
}

function injectCode(tab: chrome.tabs.Tab, callback: (args?: any) => void) {
    chrome.tabs.insertCSS(tab.id, { file: 'ext.css', allFrames: true }, () => {
        console.log('injectCode: added css file')
    });
    chrome.tabs.executeScript(tab.id, { file: 'bin/content-script.js', allFrames: true }, (res: any[]) => {
        console.log('injectCode: added bin/content-script.js file', res);
        callback();
    });

}

function loadExtensionFile(fileName: string, callback: (fileContents: string) => void) {
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

chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
    console.log('runtime.onInstalled fired:' + details.reason);
    loadExtensionFile('template.css', (content: string) => {
        let save: any = {}
        save['template.css'] = content
        chrome.storage.sync.set(save, () => {
            console.log('saved template.css file to storage');
        });
    });
});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener((tab: chrome.tabs.Tab) => {
    console.log('browserAction.onClicked fired: ', tab);
    toggleIcon(tab);
});

// Called when user switches tab. Check if enabled for this tab
chrome.tabs.onActivated.addListener((active: chrome.tabs.TabActiveInfo) => {
    console.log('tabs.onActivated fired: ', active);
    chrome.tabs.get(active.tabId, setTabState);
});


// TODO: Figure out how to make initial tab active if it was already active.
// chrome.tabs.getCurrent((tab) => {
//     console.log('tabs.getCurrent: current tab', tab)
//     setTabState(tab);
// });

// Note on chrome.storage:
// Refreshing the extension from the chrome extensions page doesn't reset data in storage.
// Removing the plugin and reloading it resets the storage.