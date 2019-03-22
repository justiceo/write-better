const writeGood = require('write-good');

chrome.runtime.onMessage.addListener(function (msg, sender, callback) {
    console.log('runtime.onMessage fired', msg);
    if (msg.text === 'analyze_doc') {
        let p = document.getElementsByClassName('kix-page');
        for (let i = 0; i < p.length; i++) {
            let t = textNodes(p[i]);
            for (let j = 0; j < t.length; j++) {
                if (t[j].textContent.trim() != "") {
                    console.debug('writeGood: ', t[j].textContent, '->', writeGood(t[j].textContent));
                }
            }
        }
        callback(document.body.innerHTML);
    }
});

function textNodes(node) {
    let all = [];
    for (node = node.firstChild; node; node = node.nextSibling) {
        if (node.nodeType == 3) all.push(node);
        else all = all.concat(textNodes(node));
    }
    return all;
}