const writeGood = require('write-good');

chrome.runtime.onMessage.addListener(function (msg, sender, callback) {
    console.log('runtime.onMessage fired', msg);
    if (msg.text === 'analyze_doc') {
        let allPages = document.querySelector('.kix-paginateddocumentplugin');
        let txts = textNodes(allPages);
        let nodeMap = {};
        for (let i = 0; i < txts.length; i++) {
            const txt = txts[i];
            if (txt.textContent.trim() != "") {
                nodeMap[txt.textContent] = writeGood(txt.textContent);
            }
        }
        console.debug('writeGood: ', nodeMap);
        callback('success');
    }
});

function textNodes(node) {
    if (!node) return [];
    let all = [];
    for (node = node.firstChild; node; node = node.nextSibling) {
        if (node.nodeType == 3) all.push(node);
        else all = all.concat(textNodes(node));
    }
    return all;
}