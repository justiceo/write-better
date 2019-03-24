import { WriteBetter } from './model';

chrome.runtime.onMessage.addListener((
    msg: string,
    sender: chrome.runtime.MessageSender,
    callback: (response?: any) => void) => {
    console.log('runtime.onMessage fired', msg);
    if (msg === 'analyze_doc') {
        let doc = WriteBetter.Doc.create();
        console.log("doc info: ", doc, doc.getQuerySelector(), doc.getSuggestions());
        doc.propagateSuggestions();
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