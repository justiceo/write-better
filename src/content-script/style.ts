import { WriteBetter } from './model';
import { Log } from '../shared/log';
import { Suggestion } from './suggestion';
import { Highlight } from './highlight';

const TAG = "style.ts";

export class Style {
    static _instance: Style;
    css: HTMLStyleElement;
    static readonly cssTemplate: string = `
            #selector:before {
                content: 'reason';
                direction: -20px;
            } `;

    private constructor() {
        this.css = document.createElement('style');
        this.css.title = 'write-better-css-file';
        this.css.type = 'text/css';
        document.body.appendChild(this.css);
    }

    static getInstance() {
        return this._instance || (this._instance = new this());
    }

    highlight(node: WriteBetter.Segment, suggestions: Suggestion[]): void {
        if (suggestions.length == 0) {
            return;
        }
        const highlights = suggestions.map(s => Highlight.of(node.getText(), s));


        // Ensure that highlights are sorted before begining to append to the dom.
        highlights.sort((a, b) => {
            if (a.index < b.index) return -1;
            if (a.index > b.index) return 1;
            return 0;
        });

        // If their index overlap, display only one of them.
        for (let i = highlights.length - 1; i >= 1; i--) {
            const h = highlights[i];
            const hprev = highlights[i - 1];
            if (hprev.index + hprev.offset >= h.index) {
                highlights.splice(i, 1);
            }
        }

        let p = node.getElement();

        // find the textnode and replace it. At its index, insert pre+highlight+post elements
        // TODO: handle the case of multiple child text nodes
        let child: ChildNode;
        for (let c of p.childNodes) {
            if (c.nodeType == 3) {
                child = c
                break;
            }
        }
        if (!child) {
            Log.error(TAG, 'could not find child text node for', node);
            return;
        }

        const text = child.textContent;
        const d = new WriteBetter.Doc().getElement().getBoundingClientRect();
        for (let i = 0; i < highlights.length; i++) {
            const h = highlights[i];
            // Insert the text up till the first highlight
            if (i == 0) {
                p.insertBefore(document.createTextNode(text.substring(0, h.index)), child);
            }

            // Insert the highlight;
            p.insertBefore(h.element, child);

            // Insert the text between this highlight and next
            if (i < highlights.length - 1) {
                const hnext = highlights[i + 1];
                p.insertBefore(document.createTextNode(text.substring(h.index + h.offset, hnext.index)), child);
            } else {
                p.insertBefore(document.createTextNode(text.substring(h.index + h.offset)), child);
            }
            // add the css rules for this highlight.
            const pos = 100 * h.element.getBoundingClientRect().left / (d.left + d.width);
            this.css.innerHTML += this.replaceAll(Style.cssTemplate, new Map([
                ['selector', h.element.id],
                ['reason', this.replaceAll(h.reason, new Map([[`'`, ``]]))],
                ['direction', pos > 70 ? 'right' : 'left'],
            ]));
        }
        p.removeChild(child);
    }

    clear() {
        this.css.remove();
        Log.debug(TAG, `removed css file from document: ${this.css.id}`)
    }

    replaceAll(input: string, pairs: Map<string, string>): string {
        pairs.forEach((newValue: string, oldValue: string) => {
            input = input.replace(new RegExp(oldValue, 'g'), newValue);
        })
        return input;
    }

    getSheet(): CSSStyleSheet {
        for (var i = document.styleSheets.length - 1; i >= 0; i--) {
            var sheet = document.styleSheets[i] as CSSStyleSheet;
            if (sheet.title == this.css.title) {
                return sheet;
            }
        }
        Log.error(TAG, 'getSheet: no sheet found')
        return null;
    }
}
