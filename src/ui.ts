import { WriteBetter } from './model';

export namespace WriteBetterUI {
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

        highlight(node: WriteBetter.Segment): void {
            if (node.highlights.length == 0) {
                return;
            }

            // Ensure that highlights are sorted before begining to append to the dom.
            node.highlights.sort((a, b) => {
                if (a.index < b.index) return -1;
                if (a.index > b.index) return 1;
                return 0;
            });

            // If their index overlap, display only one of them.
            for (let i = node.highlights.length - 1; i >= 1; i--) {
                const h = node.highlights[i];
                const hprev = node.highlights[i - 1];
                if (hprev.index + hprev.offset >= h.index) {
                    node.highlights.splice(i, 1);
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
                console.error('could not find child text node for', node);
                return;
            }

            const text = child.textContent;
            const d = new WriteBetter.Doc().getElement().getBoundingClientRect();
            for (let i = 0; i < node.highlights.length; i++) {
                const h = node.highlights[i];
                // Insert the text up till the first highlight
                if (i == 0) {
                    p.insertBefore(document.createTextNode(text.substring(0, h.index)), child);
                }

                // Insert the highlight;
                p.insertBefore(h.element, child);

                // Insert the text between this highlight and next
                if (i < node.highlights.length - 1) {
                    const hnext = node.highlights[i + 1];
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
            console.log(`removed css file from document: ${this.css.id}`)
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
            console.error('getSheet: no sheet found')
            return null;
        }

        static uniqueSelector(): string { // TODO: test for uniqueness.
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            let id = '';
            for (let i = 0; i < 20; i++) {
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return 'writebetter-' + id;
        }
    }

    export class Highlight {
        reason: string;
        index: number;
        offset: number;
        // TODO: deprecate this field to avoid misuse.
        fullText: string; // Includes the whitespace from g-inline-block breaker and other text nodes if there are multiple.
        element: HTMLSpanElement;

        static of(node: WriteBetter.Segment, suggestion: WriteBetter.Suggestion): Highlight {
            let h = new Highlight();
            h.reason = suggestion.reason;
            h.index = suggestion.index;
            h.offset = suggestion.offset;
            h.fullText = node.getText();
            // h = Highlight.patch(h);

            // create an element that wraps the suggestion.
            let el = document.createElement('span');
            el.innerText = h.fullText.substring(h.index, h.index + h.offset);
            el.id = Style.uniqueSelector();
            el.classList.add('writebetter-highlight');
            h.element = el;
            return h;
        }

        // TODO: With correct implementation, we should be able to do away with this patch.
        static patch(h: Highlight): Highlight {
            const err = h.fullText.substr(h.index, h.offset);
            if (err === err.trim() && h.reason.startsWith(`"${err}"`)) {
                return h;
            }

            if (err.startsWith(' ')) {
                const err = h.fullText.substr(h.index + 1, h.offset);
                if (err === err.trim() && h.reason.startsWith(`"${err}"`)) {
                    h.index++;
                    return h;
                }
            }

            if (err.endsWith(' ')) {
                const err = h.fullText.substr(h.index - 1, h.offset);
                if (err === err.trim() && h.reason.startsWith(`"${err}"`)) {
                    h.index--;
                    return h;
                }
            }

            console.warn('Using potentially bad highlight: ', h);
            return h;
        }
    }
}