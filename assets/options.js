
// Save options to chrome.storagr
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

// Restores select box state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get('access-level', (data) => {
        document.getElementById('access-level').value = data['access-level'];
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);