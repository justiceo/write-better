chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
    console.log('runtime.onInstalled fired:' + details.reason);
});

chrome.runtime.onSuspend.addListener(() => {
    // TODO: more cleanup.
});