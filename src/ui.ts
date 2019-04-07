import { WriteBetter } from './model';

export namespace WriteBetterUI {
    export class Style {
        static _instance: Style;
        css: HTMLStyleElement;
        static cssTemplate: string = '';

        private constructor() {
            this.css = document.createElement('style');
            this.css.title = 'write-better-css-file';
            this.css.type = 'text/css';
            document.body.appendChild(this.css);
        }

        static getInstance() {
            return this._instance || (this._instance = new this());
        }

        setTemplate(template: string): void {
            Style.cssTemplate = template;
            this.css.remove();
            document.body.appendChild(this.css);
        }

        highlight(node: WriteBetter.Segment): void {
            if (!Style.cssTemplate) {
                return console.error('template is still empty');
            }

            if (node.highlights.length > 1) {
                return;
            }
            // TODO: use the highlight with lowest recall.
            let h = node.highlights[0];

            // append this element to the dom.
            let p = node.getElement();
            p.removeChild(p.firstChild);
            p.prepend(document.createTextNode(h.fullText.substring(h.index + h.offset, h.fullText.length - 1))); // Include end to avoid zero-width char &#8203;
            p.prepend(h.element);
            p.prepend(document.createTextNode(h.fullText.substring(0, h.index)));

            // add the css rules for this highlight.
            const d = WriteBetter.Doc.getInstance().getElement().getBoundingClientRect();
            const pos = 100 * h.element.getBoundingClientRect().left / (d.left + d.width);
            this.css.innerHTML += this.replaceAll(Style.cssTemplate, new Map([
                ['selector', h.element.id],
                ['reason', this.replaceAll(h.reason, new Map([[`'`, ``]]))],
                ['direction', pos > 70 ? 'right' : 'left'],
            ]));
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

        static uniqueID(): string { // TODO: test for uniqueness.
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            let id = '';
            for (let i = 0; i < 20; i++) {
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return id;
        }
    }

    export class Highlight {
        reason: string;
        index: number;
        offset: number;
        fullText: string;
        element: HTMLSpanElement;

        static of(node: WriteBetter.Segment, suggestion: WriteBetter.Suggestion): Highlight {
            let h = new Highlight();
            h.reason = suggestion.reason;
            h.index = suggestion.index;
            h.offset = suggestion.offset;
            h.fullText = node.getText();

            // create an element that wraps the suggestion.
            let el = document.createElement('span');
            el.innerText = h.fullText.substring(h.index, h.index + h.offset);
            el.id = Style.uniqueID();
            h.element = el;
            return h;
        }
    }

    export const unregisterHandlers = (node: WriteBetter.Node, prev: string[]) => {
        if (node instanceof WriteBetter.Segment) {
            node.getElement().removeEventListener('mouseover', node.handler)
        }
        return prev;
    }
}