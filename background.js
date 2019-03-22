'use strict';

function toggleIcon(tab) {
    if (!tab) {
        return console.error('toggleIcon: tab input cannot be falsy');
    }
    const host = (new URL(tab.url)).hostname;
    if (!host) {
        return console.error('toggleIcon: hostname must be a non-nil string');
    }

    chrome.storage.sync.get(host, (data) => {
        let save = {}
        save[host] = !data[host]
        chrome.storage.sync.set(save, () => {
            console.log('toggleIcon: updated', host, 'to', save);
            setTabState(tab);
        });
    });
};

function setTabState(tab) {
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
                chrome.tabs.sendMessage(tab.id, { text: 'analyze_doc' }, (resp) => {
                    console.log('Done analyzing doc:', resp);
                });
            });
        }
    });
}

function injectCode(tab, callback) {
    chrome.tabs.insertCSS(tab.id, { file: 'ext.css', allFrames: true }, (res) => {
        console.log('injectCode: added css file', res)
    });
    chrome.tabs.executeScript(tab.id, { file: 'write-good.js', allFrames: true }, () => {
        chrome.tabs.executeScript(tab.id, { file: 'ext.js', allFrames: true }, (res) => {
            console.log('injectCode: added ext.js file', res);
            callback();
        });
    });
    
}

chrome.runtime.onInstalled.addListener(() => {
    console.log('runtime.onInstalled fired');
});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener((tab) => {
    console.log('browserAction.onClicked fired: ', tab);
    toggleIcon(tab);
});

// Called when user switches tab. Check if enabled for this tab
chrome.tabs.onActivated.addListener((active) => {
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