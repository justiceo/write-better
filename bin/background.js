(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
function toggleIcon(tab) {
    if (!tab) {
        return console.error('toggleIcon: tab input cannot be falsy');
    }
    var host = (new URL(tab.url)).hostname;
    if (!host) {
        return console.error('toggleIcon: hostname must be a non-nil string');
    }
    chrome.storage.sync.get(host, function (data) {
        var save = {};
        save[host] = !data[host];
        chrome.storage.sync.set(save, function () {
            console.log('toggleIcon: updated', host, 'to', save);
            setTabState(tab);
        });
    });
}
;
function setTabState(tab) {
    if (!tab) {
        return console.error('setTabState: tab input cannot be falsy');
    }
    var host = (new URL(tab.url)).hostname;
    if (!host) {
        return console.error('setTabState: hostname must be a non-nil string');
    }
    chrome.storage.sync.get(host, function (data) {
        console.log('setTabState: state of', host, 'is', data[host]);
        chrome.browserAction.setIcon({ path: data[host] ? 'enabled.png' : 'disabled.png' });
        if (data[host]) {
            injectCode(tab, function () {
                chrome.tabs.sendMessage(tab.id, 'analyze_doc', function (resp) {
                    console.log('Done analyzing doc:', resp);
                });
            });
        }
    });
}
function injectCode(tab, callback) {
    chrome.tabs.insertCSS(tab.id, { file: 'ext.css', allFrames: true }, function () {
        console.log('injectCode: added css file');
    });
    chrome.tabs.executeScript(tab.id, { file: 'bin/content-script.js', allFrames: true }, function (res) {
        console.log('injectCode: added bin/content-script.js file', res);
        callback();
    });
}
chrome.runtime.onInstalled.addListener(function (details) {
    console.log('runtime.onInstalled fired:' + details.reason);
});
// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
    console.log('browserAction.onClicked fired: ', tab);
    toggleIcon(tab);
});
// Called when user switches tab. Check if enabled for this tab
chrome.tabs.onActivated.addListener(function (active) {
    console.log('tabs.onActivated fired: ', active);
    chrome.tabs.get(active.tabId, setTabState);
});

},{}]},{},[1]);
