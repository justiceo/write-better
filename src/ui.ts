import { WriteBetter } from './model';

export namespace WriteBetterUI {
    export class Style {
        static _instance: Style;
        css: HTMLStyleElement;
        static cssTemplate: string = '';
        static hoverTemplate = `  
        #selector:before {
            content: '#reason';
            left: -20px; /* override programmatically when text is near edge */
        }`

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
            let h = node.highlights[0];

            // create an element that wraps the suggestion.
            let el = document.createElement('span');
            el.innerText = h.fullText.substring(h.index, h.index + h.offset);
            el.id = this.uniqueID();

            // wire up css and js events to this element.
            this.css.innerHTML += this.replaceAll(Style.cssTemplate, new Map([
                ['selector', el.id],
            ]));

            const hoverHandler = (e: MouseEvent) => {
                let rule = this.replaceAll(Style.hoverTemplate, new Map([
                    ['selector', el.id],
                    ['#reason', this.replaceAll(h.reason, new Map([[`'`, ``]]))],
                ]));
                this.css.innerHTML += " " + rule;
            };
            el.addEventListener('mouseover', hoverHandler);

            // append this element to the dom.
            let p = node.getElement();
            p.removeChild(p.firstChild);
            p.prepend(document.createTextNode(h.fullText.substring(h.index + h.offset, h.fullText.length - 1))); // Include end to avoid zero-width char &#8203;
            p.prepend(el);
            p.prepend(document.createTextNode(h.fullText.substring(0, h.index)))
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

        bgGradient(highlights: Highlight[]): string {
            let bg = "linear-gradient(to right" // transparent #start%, yellow #start%, yellow #end%, transparent #end%) !important;"
            highlights.forEach(h => {
                bg += `, transparent ${h.start}%, #f0f0f0 ${h.start}%, #f0f0f0 ${h.end}%, transparent ${h.end}%`
            });
            bg += `) !important`
            return bg;
        }

        borderGradient(highlights: Highlight[]): string {
            let bg = "linear-gradient(to right"; // linear-gradient( to right, transparent 20%, red 20%, red 40%, transparent 40%) 1 !important;
            highlights.forEach(h => {
                bg += `, transparent ${h.start}%, #ffc578 ${h.start}%, #ffc578 ${h.end}%, transparent ${h.end}%`
            });
            bg += `) 1 !important`

            return bg;
        }

        uniqueID(): string { // TODO: test for uniqueness.
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
        start: number;
        end: number;
        boxWidth: number;
        startPx: number;
        endPx: number;
        fullText: string;

        static of(node: WriteBetter.Segment, suggestion: WriteBetter.Suggestion): Highlight {
            let h = new Highlight();
            h.reason = suggestion.reason;
            h.index = suggestion.index;
            h.offset = suggestion.offset;
            h.fullText = node.getText();
            const chars = node.getText().length;
            h.start = 100 * h.index / chars;
            h.end = h.start + 100 * (h.offset) / chars;
            h.boxWidth = node.getElement().getBoundingClientRect().width;
            h.startPx = h.start * h.boxWidth / 100;
            h.endPx = h.end * h.boxWidth / 100;
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