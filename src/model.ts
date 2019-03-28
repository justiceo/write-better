import finder from '@medv/finder';
const writeGood: (input: string) => WriteBetter.Suggestion[] = require('write-good');
type xNode = Node;

export namespace WriteBetter {
    export class Suggestion {
        index: number
        offset: number
        reason: string
    }

    export interface Node {
        getQuerySelector: () => string;
        getText: () => string;
        getElement: () => HTMLElement;
        getChildren: () => Node[];
        getSuggestions: () => Suggestion[];
        visit: <T>(fn: (node: Node, prev: T[]) => T[], prev: T[]) => void
        propagateSuggestion: (suggestion: Suggestion) => void
    }

    export abstract class AbsNode implements Node {
        element: HTMLElement;

        getText(): string {
            // InnerText appproximates the rendered text of the element 
            // Text is just a concatenation of the text nodes. Not away of breaks etc.
            // See why you should always use innerText https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText#Result
            return this.element.innerText;
        }

        getElement(): HTMLElement {
            return this.element;
        }

        getSuggestions(): Suggestion[] {
            return writeGood(this.getText());
        }

        visit<T>(fn: (node: Node, prev: T[]) => T[], prev: T[]): void {
            let out = fn(this, prev);
            if (out) {
                prev.concat(out);
            }
            this.getChildren().forEach(c => {
                c.visit(fn, prev);
            });
        }

        wrap(child: Node, suggestion: Suggestion): boolean {
            // Also, if there are multiple instances of child text in parent? We have a duplicates problem.
            const index = this.getText().indexOf(child.getText());
            if (index === -1) {
                console.error(`wrap: could not find child ${child.getElement().nodeName} in ${this.getElement().nodeName} with text: ${child.getText()}`);
                return false;
            }
            return suggestion.index >= index && (suggestion.index + suggestion.offset <= index /* lower index in dup is used */ + child.getText().length);
        }

        relPosition(child: Node, suggestion: Suggestion): Suggestion {
            if (!this.wrap(child, suggestion)) {
                throw 'relPosition: cannot get relative position of suggestion that is not wrapped by node.'
            }
            const index = this.getText().search(child.getText());
            return { index: suggestion.index - index, offset: suggestion.offset, reason: suggestion.reason };
        }

        propagateSuggestion(suggestion: Suggestion): void {
            if (this instanceof Segment) {
                (this as Segment).applySuggestion(suggestion);
                return;
            }

            let matches = this.getChildren().filter(c => this.wrap(c, suggestion));
            if (matches.length > 1) {
                console.error(`propagateSuggestion: only one child should wrap a suggestion, got ${matches.length}`);
            }
            if (matches.length == 0) {
                console.error('propagateSuggestion: no child wraipped the suggestion, potentially a cross-boundary match: ', this, suggestion);
                return;
            }
            matches[0].propagateSuggestion(this.relPosition(matches[0], suggestion));
        }

        abstract getChildren(): Node[];

        abstract getQuerySelector(): string;
    }

    export class Doc extends AbsNode {
        static QuerySelector: string = '.kix-paginateddocumentplugin';
        children: Paragraph[] = [];
        static _instance: Doc;

        constructor(elem: HTMLElement) {
            super();
            if (!elem) {
                throw 'Doc.New: input element cannot be falsy';
            }
            this.element = elem;
            let children: NodeListOf<Element> = this.element.querySelectorAll(Paragraph.QuerySelector);
            children.forEach((e: Element) => {
                if ((e as HTMLElement).innerText.trim()) {
                    this.children.push(new Paragraph(e as HTMLElement));
                }
            });
        }

        static getInstance(): Doc {
            return this._instance || (this._instance = new this(document.querySelector(Doc.QuerySelector)));
        }

        getChildren(): Node[] {
            return this.children;
        }

        getQuerySelector(): string {
            return Doc.QuerySelector;
        }

        propagateSuggestions(): void {
            this.getSuggestions().forEach(s => this.propagateSuggestion(s));
        }
    }

    export class Paragraph extends AbsNode {
        static QuerySelector: string = '.kix-paragraphrenderer';
        children: Line[] = [];

        constructor(elem: HTMLElement) {
            super();
            this.element = elem;
            // this.uniqueSelector = finder(elem);
            let children: NodeListOf<Element> = this.element.querySelectorAll(Line.QuerySelector);
            children.forEach((e: Element) => {
                if ((e as HTMLElement).innerText.trim()) {
                    this.children.push(new Line(e as HTMLElement));
                }
            });
        }

        getChildren(): Node[] {
            return this.children;
        }

        getQuerySelector(): string {
            return Paragraph.QuerySelector;
        }
    }

    export class Line extends AbsNode {
        static QuerySelector: string = '.kix-lineview';
        children: Segment[] = [];

        constructor(elem: HTMLElement) {
            super();
            this.element = elem;
            let children = this.textNodes(elem);
            children.forEach((e: Text) => {
                if (e.textContent) {
                    this.children.push(new Segment(e.parentElement));
                }
            });
        }

        getChildren(): Node[] {
            return this.children;
        }

        getQuerySelector(): string {
            return Line.QuerySelector;
        }

        textNodes(el: HTMLElement): Text[] {
            const textNodes: Text[] = [];
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
            let n: xNode;
            while (n = walker.nextNode()) {
                textNodes.push(n as Text);
            }
            return textNodes;
        }
    }

    // Segment is the immediate parent of a text node. 
    // Its only child is the text node and it should be treated as a textnode.
    export class Segment extends AbsNode {
        handler: (e: MouseEvent) => void;
        selector = '';
        highlights: Highlight[] = [];

        constructor(elem: HTMLElement) {
            super();
            this.element = elem;
            if (elem.childElementCount != 1) {
                console.debug(`Segment.constructor: segment has ${elem.childElementCount} children expected 1.`);
            }

            let selector = '';
            try {
                selector = finder(this.getElement(), { threshold: 2 });
            } catch (err) {
                console.error(`new Segment(): error getting unique selector: ${err}`);
                return;
            }
            this.selector = selector;
        }

        getChildren(): Node[] {
            // TODO: throw 'getChildren: unimplemented exception - base node is intended to be used as text node.'
            return []
        }

        getQuerySelector(): string {
            // TODO: throw 'getQuerySelector: unimplemented exception - base node is intended to be used as text node.'
            return 'this_is_the_end_of_the_road_until_I_fix_it'
        }

        applySuggestion(suggestion: Suggestion): void {
            this.highlights.push(Highlight.of(this, suggestion));
            Style.getInstance().highlight(this, suggestion);
            console.log('applied suggestion', suggestion, 'on text: ', this.getText());
        }
    }

    class Highlight {
        reason: string;
        start: number;
        end: number;
        boxWidth: number;
        startPx: number;
        endPx: number;

        static of(node: Segment, suggestion: Suggestion): Highlight {
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

        highlight(node: Segment, suggestion: Suggestion): void {
            this.underline(node, suggestion);
            this.registerHover(node, suggestion);
        }

        clear() {
            this.css.remove();
            console.log(`removed css file from document: ${this.css.id}`)
        }

        underline(node: Segment, suggestion: Suggestion): void {
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

        registerHover(node: Segment, suggestion: Suggestion): void {
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

    export const unregisterHandlers = (node: Node, prev: string[]) => {
        if (node instanceof Segment) {
            node.getElement().removeEventListener('mouseover', node.handler)
        }
        return prev;
    }

}