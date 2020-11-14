import { Model } from './model';
import { Log } from '../shared/log';
import { Suggestion } from './suggestion';
import { Highlight } from './highlight';
import { getEditor } from './editor';

const TAG = "style.ts";

export class Style {
    private static _instance: Style;
    private css: HTMLStyleElement;
    private static readonly cssTemplate: string = `
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

    highlight(node: Model.Segment, suggestions: Suggestion[]): void {
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

        // If multiple suggestions are overlapping, display only the first occurring suggestion.
        for (let i = highlights.length - 1; i >= 1; i--) {
            const h = highlights[i];
            const hprev = highlights[i - 1];
            if (hprev.index + hprev.offset >= h.index) {
                highlights.splice(i, 1);
            }
        }

        const element = node.getElement();

        // Find the first non-empty text node, bail otherwise.
        let originalTextNode: ChildNode;
        for (let c of element.childNodes) {
            if (c.nodeType == Node.TEXT_NODE && c.textContent !== "") {
                originalTextNode = c
                break;
            }
        }
        if (!originalTextNode) {
            Log.error(TAG, 'Could not find child text node for', node);
            return;
        }

        // Rebuild the text node, replacing affected text segments with highlight elements.
        const text = originalTextNode.textContent;
        const d = getEditor().getDocument().getBoundingClientRect();
        for (let i = 0; i < highlights.length; i++) {
            const h = highlights[i];
            // Insert the text up till the first highlight
            if (i == 0) {
                element.insertBefore(document.createTextNode(text.substring(0, h.index)), originalTextNode);
            }

            // Insert the highlight;
            element.insertBefore(h.element, originalTextNode);

            // Insert the text between this highlight and next. Otherwise, insert rest of text.
            if (i < highlights.length - 1) {
                const hnext = highlights[i + 1];
                element.insertBefore(document.createTextNode(text.substring(h.index + h.offset, hnext.index)), originalTextNode);
            } else {
                element.insertBefore(document.createTextNode(text.substring(h.index + h.offset)), originalTextNode);
            }

            // Add the css rules for this highlight.
            const pos = 100 * h.element.getBoundingClientRect().left / (d.left + d.width);
            this.css.innerHTML += Style.replaceAll(Style.cssTemplate, new Map([
                ['selector', h.element.id],
                ['reason', Style.replaceAll(h.reason, new Map([[`'`, ``]]))],
                ['direction', pos > 70 ? 'right' : 'left'],
            ]));
        }

        // Remove the original text node.
        element.removeChild(originalTextNode);
    }

    /* Remove highlight CSS from the DOM */
    clear() {
        Log.debug(TAG, `Removing css file from document: ${this.css.title}`)
        this.css.remove();
    }

    private static replaceAll(input: string, pairs: Map<string, string>): string {
        pairs.forEach((newValue: string, oldValue: string) => {
            input = input.replace(new RegExp(oldValue, 'g'), newValue);
        })
        return input;
    }
}
