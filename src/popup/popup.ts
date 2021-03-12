// See https://codepen.io/justiceo/pen/BaQZBqa?editors=1010


// Save options to chrome.storage
function save_options() {
    const access = document.getElementById('access-level').value;
    chrome.storage.sync.set({ 'access-level': access }, () => {
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 750);
    });
}

function toggleSiteStatus() {
    const siteKey =  `disabled-site-${location.hostname}`;
    chrome.storage.sync.get(siteKey, (data) => {
        if (data) {
            chrome.storage.sync.remove(siteKey, () => {
                // show notice.
                setTimeout(() => {
                    // clear notice
                }, 750);
            });
        } else {
            chrome.storage.sync.set({siteKey: true}, () => {
                // show notice.
                setTimeout(() => {
                    // clear notice
                }, 750);
            });
        }
    });
}

// Restores select box state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get('access-level', (data) => {
        document.getElementById('access-level').id = data['access-level'];
    });
}

// https://developer.chrome.com/docs/extensions/reference/browserAction/
class BrowserAction {

    setIcon(details: chrome.browserAction.TabIconDetails,callback: Function) {
        chrome.browserAction.setIcon(details, callback);

        
    }

    

}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);