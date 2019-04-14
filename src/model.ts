import { WriteBetterUI } from './ui';
const writeGood: (input: string) => WriteBetter.Suggestion[] = require('write-good');
type xNode = Node;

export namespace WriteBetter {
    export class Suggestion {
        index: number
        offset: number
        reason: string
    }

    export interface Node {
        getText: () => string;
        getElement: () => HTMLElement;
        getChildren: () => Node[];
        getSuggestions: () => Suggestion[];
        visit: <T>(fn: (node: Node, prev: T[]) => T[], prev: T[]) => void
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

        abstract getChildren(): Node[];
    }

    export class Doc extends AbsNode {
        static QuerySelector: string = '.kix-paginateddocumentplugin';
        children: Page[] = [];
        static _instance: Doc;

        constructor(elem: HTMLElement) {
            super();
            if (!elem) {
                throw 'Doc.New: input element cannot be falsy';
            }
            this.element = elem;
            let children: NodeListOf<Element> = this.element.querySelectorAll(Page.QuerySelector);
            children.forEach((e: Element) => {
                if ((e as HTMLElement).innerText.trim()) {
                    this.children.push(new Page(e as HTMLElement));
                }
            });
        }

        static getInstance(): Doc {
            return this._instance || (this._instance = new this(document.querySelector(Doc.QuerySelector)));
        }

        getChildren(): Node[] {
            return this.children;
        }
    }

    export class Page extends AbsNode {
        static QuerySelector: string = ':scope .kix-page-content-wrapper';
        children: Paragraph[] = [];

        constructor(elem: HTMLElement) {
            super();
            this.element = elem;
            let children: NodeListOf<Element> = this.element.querySelectorAll(Paragraph.QuerySelector);
            children.forEach((e: Element) => {
                if ((e as HTMLElement).innerText.trim()) {
                    this.children.push(new Paragraph(e as HTMLElement));
                }
            });
        }

        getChildren(): Node[] {
            return this.children;
        }
    }

    export class Paragraph extends AbsNode {
        static QuerySelector: string = ':scope .kix-paragraphrenderer';
        children: Line[] = [];

        constructor(elem: HTMLElement) {
            super();
            this.element = elem;
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
    }

    export class Line extends AbsNode {
        static QuerySelector: string = ':scope .kix-lineview';
        children: Segment[] = [];

        constructor(elem: HTMLElement) {
            super();
            this.element = elem;
            let children = this.textNodes(elem);
            children.forEach((e: Text) => {
                if (e.textContent.trim()) {
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
        highlights: WriteBetterUI.Highlight[] = [];

        constructor(elem: HTMLElement) {
            super();
            this.element = elem;
            let count = 0;
            elem.childNodes.forEach(c => {
                if (c.nodeType == 3) {
                    count++;
                }
            })
            if (count != 1) {
                console.error(`Segment.constructor: segment has ${elem.childElementCount} text nodes expected 1`);
            }
        }

        getChildren(): Node[] {
            console.error('Segment.getChildren: segment is intended to be used as text node and should not have children');
            return []
        }

        applySuggestions(suggestions: Suggestion[]): void {
            suggestions.forEach(s => this.highlights.push(WriteBetterUI.Highlight.of(this, s)));
            WriteBetterUI.Style.getInstance().highlight(this);
            console.info('applied suggestion', suggestions, 'on text: ', this.getText());
        }
    }

    export const propagateSuggestions = (node: Node, suggestions: Suggestion[]) => {
        console.group(node, 'suggestions', suggestions);
        if (node instanceof Segment) {
            node.applySuggestions(suggestions);
            console.groupEnd();
            return;
        }

        if (node instanceof Paragraph) {
            suggestions = node.getSuggestions();
        }

        node.getChildren().forEach(c => {
            const childSuggestions: Suggestion[] = []
            suggestions.forEach(s => {
                // TODO: need to handle case when there are multiple matches.
                const index = node.getText().indexOf(c.getText(), 0);
                if (index === -1) {
                    console.warn(`propagateSuggestions: could not find child ${c.getElement().nodeName} in ${node.getElement().nodeName} with text: ${c.getText()}`);
                    return;
                }
                if (s.index >= index && (s.index + s.offset <= index + c.getText().length)) {
                    childSuggestions.push({ index: s.index - index, offset: s.offset, reason: s.reason });
                }
            });
            if (childSuggestions.length > 0){
                propagateSuggestions(c, childSuggestions);
            }
        });
        console.groupEnd();
    }
}