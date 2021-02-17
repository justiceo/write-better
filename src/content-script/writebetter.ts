import { from, interval, Observable } from 'rxjs';
import { filter, map, finalize } from 'rxjs/operators';
import { Suggestion } from './suggestion';
import { Log } from '../shared/log';
import { Highlight } from './highlight';
const writeGood: (input: string) => Suggestion[] = require('write-good');

const TAG = 'writebetter.ts';
export class WriteBetter {
    previousText: string = null;
    selector: string = null; // TODO: parameterize.
    static cache: Map<string, boolean> = new Map();
    static tempCache: Map<string, boolean> = new Map();
    private css: HTMLStyleElement;
    private static readonly cssTemplate: string = `
            #selector:before {
                content: 'reason';
                direction: -20px;
            } `;

    constructor() {
        this.css = document.createElement('style');
        this.css.title = 'write-better-css-file';
        this.css.id = 'write-better-css';
        // TODO: Remove stylesheet if it already exists.
        document.body.appendChild(this.css);
    }

    analyze(selector: string, inplace = true): HTMLElement {
        Log.debug(TAG, "#analyze", selector);
        const e = document.querySelector(selector) as HTMLElement;
        if (e == null) {
            return null;
        }

        if (this.getCleanText(e) == this.previousText) {
            return e;
        }

        this.previousText = this.getCleanText(e);
        this.selector = selector;

        const subscription = this.smartSplitter(e)
            .pipe(map(e => this.applySuggestions(e, inplace)),
                finalize(() => {
                    Log.debug(TAG, "Done...");
                    WriteBetter.cache = WriteBetter.tempCache;
                }));

        // TODO: if not inplace, attempt to reconstruct e before returning it.
        subscription.subscribe(e => Log.debug(TAG, " "), err => Log.error(TAG, err));
        return e;
    }


    analyzeAndWatch(selector: string): Observable<HTMLElement> {
        return interval(2000).pipe(map(_ => this.analyze(selector)));
    }

    applySuggestions(paragraph: HTMLElement, inplace: boolean): HTMLElement {
        return this.applySuggestionsInternal(paragraph, this.getSuggestions(paragraph), inplace);
    }

    applySuggestionsInternal(paragraph: HTMLElement, suggestions: Suggestion[], inplace: boolean): HTMLElement {
        Log.debug(TAG, "#applySuggestionsInternal", this.getCleanText(paragraph), suggestions);
        paragraph = inplace ? paragraph : paragraph.cloneNode(true) as HTMLElement
        if (suggestions.length == 0) {
            Log.debug(TAG, "No suggestions for paragraph: ", this.getCleanText(paragraph));
            return paragraph;
        }

        const highlights = suggestions.map(s => Highlight.of(this.getText(paragraph), s));

        // Ensure that highlights are sorted before begining to append to the dom.
        highlights.sort((a, b) => {
            if (a.index < b.index) return -1;
            if (a.index > b.index) return 1;
            return 0;
        });

        // If multiple suggestions are overlapping, display only the first occurring suggestion.
        for (let i = highlights.length - 1; i >= 1; i--) {
            const h = highlights[i];
            const hprev = highlights[i - 1];
            if (hprev.index + hprev.offset >= h.index) {
                highlights.splice(i, 1);
                Log.debug(TAG, "Skipping overlapping highlight with text `", this.getText(h.element), "`");
                continue;
            }
        }

        // Find the relevant text node and update it.
        for (let i = 0; i < highlights.length; i++) {
            const h = highlights[i];
            // https://devhints.io/xpath for xpath cheatseat.
            const xpathExpression = `//div//text()[contains(.,'${this.getText(h.element)}')]`;
            const nodesSnapshot = document.evaluate(xpathExpression, paragraph, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

            for (let j = 0; j < nodesSnapshot.snapshotLength; j++) {
                const currMatch = nodesSnapshot.snapshotItem(j);
                
                // TODO: Also skip hidden nodes https://stackoverflow.com/a/21696585/3665475
                // TODO: This is still susceptible to matching two different nodes "So" and "Some" for the error "So".
                if (paragraph.contains(currMatch) /*&& currMatch.textContent.match(`\b${this.getText(h.element)}\b`) */) {
                    this.updateTextNode(currMatch, h);
                    this.updateCSS(this.selector, h);
                    break;
                } else {
                    Log.debug(`Skipping not matching node '${currMatch.textContent}' for suggestion '${this.getText(h.element)}'`);
                }
            }
        }

        return paragraph;
    }

    updateTextNode(node: Node, h: Highlight): HTMLElement {
        Log.debug(TAG, `#updateTextNode: highlight '${this.getText(h.element)}' in  '${node.textContent}'`);
        const parent = node.parentElement;
        // If already highlighted, just return it.
        if (parent.classList.contains("writebetter-highlight")) {
            Log.debug(TAG, `#updateTextNode: skipping already highlighted suggestion '${this.getText(h.element)}'`);
            return parent;
        }

        // Find location of suggestion in the text node containing it.
        const index = node.textContent.indexOf(this.getText(h.element), 0);
        if (index < 0) {
            Log.error(TAG, `#updateTextNode, suggestion '${this.getText(h.element)}' not found`);
            return parent;
        }

        // Insert adjacent to textnode in-case there are multiple nodes under its parent.
        const originalText = this.getText(parent);
        parent.insertBefore(document.createTextNode(node.textContent.substring(0, index)), node);
        parent.insertBefore(h.element, node);
        parent.insertBefore(document.createTextNode(node.textContent.substring(index + h.offset)), node);
        parent.removeChild(node);

        if (originalText != this.getText(parent)) {
            Log.error(TAG, `#updateTextNode: improperly modified parent '${this.getText(parent)}'`);
            // TODO: consider reverting the change.
        }
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

    getCleanText(e: HTMLElement): string {
        return this.getText(e).replace(/\u200C/g, '').replace('  ', ' ').trim();
    }

    // Only returns elements that contain text which *needs* to be analyzed.
    // NB: Concating the result of this function would not yield its input.
    smartSplitter(e: HTMLElement): Observable<HTMLElement> {
        Log.debug(TAG, "#smartSplitter");
        if (this.isGoogleDocs()) {
            return from(e.querySelectorAll<HTMLElement>(":scope .kix-paragraphrenderer").values())
                .pipe(filter(e => !!this.getCleanText(e))) // only emit paragraphs with text.
                .pipe(filter(e => !this.isCached(e))); // only emit modified paragraphs.
        }

        return from([]);
    }

    isCached(paragraph: HTMLElement): boolean {
        WriteBetter.tempCache.set(this.getCleanText(paragraph), true);
        return WriteBetter.cache.has(this.getCleanText(paragraph));
    }

    isGoogleDocs(): boolean {
        return location.hostname.includes("docs.google.com");
    }

    // @Deprecated.
    unapplyHiglights(paragraph: HTMLElement) {
        const highlights = paragraph.querySelectorAll(".writebetter-highlight");
        highlights.forEach(h => h.outerHTML = h.innerHTML);
    }

    static replaceAll(input: string, pairs: Map<string, string>): string {
        pairs.forEach((newValue: string, oldValue: string) => {
            input = input.replace(new RegExp(oldValue, 'g'), newValue);
        })
        return input;
    }


    /* Remove highlight CSS from the DOM */
    clear() {
        Log.debug(TAG, `Removing css file from document: ${this.css.id}`)
        this.css.remove();
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