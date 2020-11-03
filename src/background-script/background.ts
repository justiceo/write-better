chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
    console.log('runtime.onInstalled fired:' + details.reason);
    if (details.reason === 'install') {
        chrome.tabs.create({
            url: 'https://docs.google.com/document/d/1pobtU3ZX0eJkMGXBa0dcH8LkJB3jRFt31dZwY3ozeLM',
            active: true
        });
        return false;
    }
});

chrome.runtime.onSuspend.addListener(() => {
    // TODO: more cleanup.
});