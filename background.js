'use strict';

function toggleIcon() {
    chrome.storage.sync.get('isEnabled', function (data) {
        chrome.storage.sync.set({ isEnabled: !data.isEnabled }, function () {
            console.log('Enabled is ' + !data.isEnabled);
        });
        chrome.browserAction.setIcon({ path: data.isEnabled ? 'disabled.png' : 'enabled.png' });
    });
};

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ isEnabled: false }, function () {
        console.log('Enabled is false');
    });
    chrome.browserAction.setIcon({ path: 'disabled.png' });
});

chrome.browserAction.onClicked.addListener(toggleIcon);