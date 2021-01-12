import { from, interval, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Suggestion } from './suggestion';
import { Log } from '../shared/log';
import { Highlight } from './highlight';
const writeGood: (input: string) => Suggestion[] = require('write-good');

const TAG = 'writebetter.ts';
export class WriteBetter {
    previousText: string = null;
    selector: string = null; // TODO: parameterize.
    static cache: Map<string, string> = new Map();
    private css: HTMLStyleElement;
    private static readonly cssTemplate: string = `
            #selector:before {
                content: 'reason';
                direction: -20px;
            } `;

    constructor() {
        this.css = document.createElement('style');
        this.css.title = 'write-better-css-file';
        this.css.type = 'text/css';
        document.body.appendChild(this.css);
    }

    analyze(selector: string, inplace = true, paragraphSplitter = this.smartSplitter): HTMLElement {
        Log.debug(TAG, "#analyze", selector);
        const e = document.querySelector(selector) as HTMLElement;
        if (e == null) {
            return null;
        }

        if (this.getText(e) == this.previousText) {
            return e;
        }

        this.previousText = this.getText(e);
        this.selector = selector;

        const subscription = this.smartSplitter(e)
            .pipe(map(e => this.applySuggestions(e, inplace)));

        // TODO: if not inplace, attempt to reconstruct e before returning it.
        subscription.subscribe(e => Log.debug(TAG, "updating: ", e))
        return e;
    }


    analyzeAndWatch(selector: string): Observable<HTMLElement> {
        Log.debug(TAG, "#analyzeAndWatch", selector);
        return interval(1000).pipe(map(_ => this.analyze(selector)));
    }

    applySuggestions(paragraph: HTMLElement, inplace: boolean): HTMLElement {
        Log.debug(TAG, "#applySuggestions");
        return this.applySuggestionsInternal(paragraph, this.getSuggestions(paragraph), inplace);
    }

    applySuggestionsInternal(paragraph: HTMLElement, suggestions: Suggestion[], inplace: boolean): HTMLElement {
        Log.debug(TAG, "#applySuggestionsInternal", suggestions);
        paragraph = inplace ? paragraph : paragraph.cloneNode(true) as HTMLElement
        if (suggestions.length == 0) {
            return paragraph;
        }

        const highlights = suggestions.map(s => Highlight.of(paragraph.innerText, s));

        // Ensure that highlights are sorted before begining to append to the dom.
        highlights.sort((a, b) => {
            if (a.index < b.index) return -1;
            if (a.index > b.index) return 1;
            return 0;
        });


        for (let i = highlights.length - 1; i >= 1; i--) {
            const h = highlights[i];
            const hprev = highlights[i - 1];
            // If multiple suggestions are overlapping, display only the first occurring suggestion.
            if (hprev.index + hprev.offset >= h.index) {
                highlights.splice(i, 1);
                continue;
            }

            // Find the relevant text node.        
            const nodesSnapshot = new XPathEvaluator().evaluate(`//text()[contains(.,'${h.element.innerText}')]`, paragraph, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            // Update it
            if (nodesSnapshot.snapshotLength > 0) {
                this.updateTextNode(nodesSnapshot.snapshotItem(0), h);
                this.updateCSS(this.selector, h);
            }
        }

        return paragraph;
    }

    updateTextNode(node: Node, h: Highlight): HTMLElement {
        Log.debug(TAG, "#updateTextNode for '", h.element.innerText, "'");
        const parent = node.parentElement;
        const originalText = parent.textContent; // innerText??
        // Find index of text in parent which can be arbitrarily located in the paragraph.
        // TODO: Instead 0 for position allow multiple of same highlight per text.
        const index = parent.innerText.indexOf(h.element.innerText, 0);

        parent.appendChild(document.createTextNode(originalText.substring(0, index)));
        parent.appendChild(h.element);
        parent.appendChild(document.createTextNode(originalText.substring(index + h.offset)));
        parent.removeChild(node);
        return parent;
    }

    updateCSS(selector: string, h: Highlight) {
        // Add the css rules for this highlight.
        const d = document.querySelector(selector).getBoundingClientRect();        
        const pos = 100 * h.element.getBoundingClientRect().left / (d.left + d.width);
        // TODO: Update to use string formatter here.
        const newStyle = WriteBetter.replaceAll(WriteBetter.cssTemplate, new Map([
            ['selector', h.element.id],
            ['reason', WriteBetter.replaceAll(h.reason, new Map([[`'`, ``]]))],
            ['direction', pos > 70 ? 'right' : 'left'],
        ]));
        this.css.appendChild(document.createTextNode(newStyle));
    }

    getSuggestions(e: HTMLElement): Suggestion[] {
        return writeGood(this.getText(e))
    }


    getText(e: HTMLElement): string {
        // InnerText appproximates the rendered text of the element 
        // Text is just a concatenation of the text nodes. Not away of breaks etc.
        // See why you should always use innerText https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText#Result
        return e.innerText;
    }

    // Only returns elements that contain text which *needs* to be analyzed.
    // NB: Concating the result of this function would not yield its input.
    smartSplitter(e: HTMLElement): Observable<HTMLElement> {
        Log.debug(TAG, "#smartSplitter", this);
        if (this.isGoogleDocs()) {
            return from(e.querySelectorAll<HTMLElement>(":scope .kix-paragraphrenderer").values())
                .pipe(filter(e => !!e.innerText.trim())) // only emit paragraphs with text.
                .pipe(filter(e => this.needsAnalyzing(e))); // only emit unprocessed or modified paragraphs.
        }

        return from([]);
    }

    needsAnalyzing(e: HTMLElement): boolean {
        return !WriteBetter.cache.has(getPathTo(e)) || WriteBetter.cache.get(getPathTo(e)) != e.innerText;
    }

    isGoogleDocs(): boolean {
        return location.hostname.includes("docs.google.com");
    }

    static replaceAll(input: string, pairs: Map<string, string>): string {
        pairs.forEach((newValue: string, oldValue: string) => {
            input = input.replace(new RegExp(oldValue, 'g'), newValue);
        })
        return input;
    }
}

// Ref - https://stackoverflow.com/a/2631931
function getPathTo(element: any): string {
    if (element.id !== '')
        return 'id("' + element.id + '")';
    if (element === document.body)
        return element.tagName;

    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
        var sibling = siblings[i];
        if (sibling === element)
            return getPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
            ix++;
    }
}