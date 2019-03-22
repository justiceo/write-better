chrome.runtime.onMessage.addListener(function (msg, sender, callback) {
    console.log('runtime.onMessage fired', msg);
    if (msg.text === 'analyze_doc') {
        let p = document.getElementsByClassName('kix-page');
        for (let i = 0; i < p.length; i++) {
            console.log("kix page text: ", textNodes(p[i]));
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