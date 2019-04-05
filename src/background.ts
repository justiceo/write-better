import { EnableOnDocs, GetExtensionFile } from './shared';

chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
    console.log('runtime.onInstalled fired:' + details.reason);
    GetExtensionFile('template.css', () => console.log('saved template.css file to storage'));
    GetExtensionFile('underline.css', () => console.log('saved underline.css file to storage'));
    GetExtensionFile('hover.css', () => console.log('saved hover.css file to storage'));
    EnableOnDocs(() => console.log('enabled extensions on gdocs.'));
});

chrome.runtime.onSuspend.addListener(() => {
    // TODO: more cleanup.
});