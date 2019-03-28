import { WriteBetter } from './model';

export namespace WriteBetterUI {
    export class Style {
        static _instance: Style;
        css: HTMLStyleElement;
        static cssTemplate: string = '';
        static hoverTemplate = `
        #selector:hover {    
            background-repeat: no-repeat;
            background-image: background_gradient;
        }
        
        #selector:after {
            left: arrow_left_push;
        }
        
        #selector:before {
            content: '#reason';
            left: box_left_push;
        }
        
        #selector:hover:before,
        #selector:hover:after {
            opacity: 1;
            transform: scale3d(1, 1, 1);
        }
        
        #selector:hover:after {
            transition: all .2s .1s ease-in-out;
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

        highlight(node: WriteBetter.Segment, suggestion: WriteBetter.Suggestion): void {
            this.underline(node, suggestion);
            this.registerHover(node, suggestion);
        }

        clear() {
            this.css.remove();
            console.log(`removed css file from document: ${this.css.id}`)
        }

        underline(node: WriteBetter.Segment, suggestion: WriteBetter.Suggestion): void {
            if (!Style.cssTemplate) {
                return console.error('template is still empty');
            }
            this.css.innerHTML += this.replaceAll(Style.cssTemplate, new Map([
                ['#selector', node.selector],
                ['border_gradient', this.borderGradient(node.highlights)],
            ]));
        }

        replaceAll(input: string, pairs: Map<string, string>): string {
            pairs.forEach((newValue: string, oldValue: string) => {
                input = input.replace(new RegExp(oldValue, 'g'), newValue);
            })
            return input;
        }

        registerHover(node: WriteBetter.Segment, suggestion: WriteBetter.Suggestion): void {
            let rule = ''
            node.handler = (e: MouseEvent) => {
                // TODO: start listening for mousemove
                const boxX = (node.getElement().getBoundingClientRect() as DOMRect).x;
                const mouseX = e.clientX - boxX;
                const h = node.highlights.find(h => mouseX >= h.startPx && mouseX <= h.endPx);
                if (!h) {
                    // TODO: consider setting to nearest neighbor. Especially given that hover can be tricky
                    return;
                }
                console.log('hovered on error');
                rule = this.replaceAll(Style.hoverTemplate, new Map([
                    ['#selector', node.selector],
                    ['background_gradient', this.bgGradient([h])],
                    ['#reason', this.replaceAll(h.reason, new Map([[`'`, ``]]))],
                    ['box_left_push', (h.startPx - 20).toString() + 'px'],
                    ['arrow_left_push', (h.startPx + 5).toString() + 'px'],
                ]));
                this.css.innerHTML += " " + rule;
            }

            let mouseoutHandler = (e: MouseEvent) => {
                // TODO: stop listening to mousemove
                // TODO: remove css from stylesheet
                let sheet = this.getSheet();
                // sheet.insertRule adds new sheet at index 0 by default
                // it is our best bet on CSS wrangling since reformating by engine makes find/replace impossible.
                // it'll best be implemented after we've moved out this class.
                for (let i = 0; i < sheet.rules.length; i++) {
                    if (sheet.rules[i].type == CSSRule.STYLE_RULE) { // https://developer.mozilla.org/en-US/docs/Web/API/CSSRule#Type_constants
                        let sr = sheet.rules[i] as CSSStyleRule;
                        if (sr.selectorText == node.selector) {
                            // found matching selector
                        }
                    }
                }
            }

            // One handler is enough for all the highlights.
            if (node.highlights.length == 1) {
                // Bug: mouseover doesn't trigger when error is a link text.
                node.getElement().addEventListener('mouseover', node.handler);
                node.getElement().addEventListener('mouseout', mouseoutHandler);
            }
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
    }

    export class Highlight {
        reason: string;
        start: number;
        end: number;
        boxWidth: number;
        startPx: number;
        endPx: number;

        static of(node: WriteBetter.Segment, suggestion: WriteBetter.Suggestion): Highlight {
            let h = new Highlight();
            h.reason = suggestion.reason;
            const chars = node.getText().length;
            h.start = 100 * suggestion.index / chars;
            h.end = h.start + 100 * (suggestion.offset) / chars;
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