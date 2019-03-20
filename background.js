'use strict';

function toggleIcon(tab) {
    const url = (new URL(tab.url)).hostname
    chrome.storage.sync.get(url, (data) => {
        let save = {}
        save[url] = !data[url]
        chrome.storage.sync.set(save, () => {
            console.log('updated', url, 'to', save);
        });
        chrome.browserAction.setIcon({ path: data[url] ? 'disabled.png' : 'enabled.png' });
    });
};

function checkStatus(tab) {
    if (!tab) {
        return
    }
    const url = (new URL(tab.url)).hostname
    chrome.storage.sync.get(url, (data) => {
        console.log('value of', url, ':', data)
        chrome.browserAction.setIcon({ path: data[url] ? 'enabled.png' : 'disabled.png' });
    });
}

chrome.runtime.onInstalled.addListener(function () {
    chrome.tabs.getCurrent(checkStatus);
});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(toggleIcon);

// Called when user switches tab. Check if enabled for this tab
chrome.tabs.onActivated.addListener(function (active) {
    console.log('tab', tab.tabId, 'activated');
    chrome.tabs.get(active.tabId, checkStatus)
});