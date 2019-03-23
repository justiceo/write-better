
const writeGood: (input: string) => [{ index: number, offset: number, suggestion: string }] = require('write-good');

chrome.runtime.onMessage.addListener((
    msg: string,
    sender: chrome.runtime.MessageSender,
    callback: (response?: any) => void) => {
    console.log('runtime.onMessage fired', msg);
    if (msg === 'analyze_doc') {
        let allPages: Element = document.querySelector('.kix-paginateddocumentplugin');

        let txts = textNodes(allPages);
        let nodeMap: any = {};
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

function textNodes(node: Element): Element[] {
    if (!node) return [];
    let all: Element[] = [];
    for (node = node.firstChild as Element; node; node = node.nextSibling as Element) {
        if (node.nodeType == 3) all.push(node);
        else all = all.concat(textNodes(node));
    }
    return all;
}