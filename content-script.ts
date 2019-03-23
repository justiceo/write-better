import finder from '@medv/finder'

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
                txt = txt.substring(0, s.index) + '<strong class="suggestion"s>' + txt.substring(s.index, s.index + s.offset) + '</strong>' + txt.substring(s.index + s.offset);
            }
            if (txts[i].textContent.length == txt.length) {
                continue;
            }
            nodeMap[txts[i].textContent] = txt;
            let selector = "";
            try {
                selector = finder(txts[i].parentElement as Element);
            } catch (err) {
                console.log(err, txts[i].nodeType, txts[i].nodeName);
            }
            console.log("unique css", selector);
            document.body.appendChild(stylesheet(`${selector} {
                border-bottom: 2px solid black;
            }`))
        }
        console.debug('writeGood: ', nodeMap);
        callback('success');
    }
});

// https://developer.mozilla.org/en-US/docs/Web/API/Element
function textNodes(node: Element): Element[] {
    if (!node) return [];
    let all: Element[] = [];
    for (node = node.firstChild as Element; node; node = node.nextSibling as Element) {
        if (node.nodeType == 3) all.push(node);
        else all = all.concat(textNodes(node));
    }
    return all;
}

/**
 * Convert markup to element. For compatibility with older browsers see https://stackoverflow.com/a/35385518
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function element(html: string): Element {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild as Element;
}

function stylesheet(rules: string): HTMLStyleElement {
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = rules;
    return css;
}