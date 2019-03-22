const writeGood = require('write-good');

chrome.runtime.onMessage.addListener(function (msg, sender, callback) {
    console.log('runtime.onMessage fired', msg);
    if (msg.text === 'analyze_doc') {
        let allPages = document.querySelector('.kix-paginateddocumentplugin');

        let txts = textNodes(allPages);
        let nodeMap = {};
        for (let i = 0; i < txts.length; i++) {
            let txt = txts[i].textContent;
            if (txt.trim() == "") {
                continue;
            }
            const suggestions = writeGood(txt);
            for (let j = suggestions.length - 1; j >= 0; j--) {
                const s = suggestions[j];
                txt = txt.substring(0, s.index) + '<strong>' + txt.substring(s.index, s.index + s.offset) + '</strong>' + txt.substring(s.index + s.offset);
            }
            nodeMap[txts[i].textContent] = txt;
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