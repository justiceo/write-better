import finder from '@medv/finder';
const writeGood: (input: string) => WBSuggestion[] = require('write-good');

export class WBSuggestion {
    start: number
    offset: number
    text: string
}

export interface WBNode {
    getUniqueSelector: () => string;
    getQuerySelector: () => string;
    getText: () => string;
    getElement: () => HTMLElement;
    getChildren: () => WBNode[];
    getSuggestions: () => WBSuggestion[];
    visit: <T>(fn: (node: WBNode, prev: T[]) => T[], prev: T[]) => void
}

export abstract class WBAbsNode implements WBNode {
    uniqueSelector: string;
    element: HTMLElement;

    getUniqueSelector(): string {
        return this.uniqueSelector;
    }

    getText(): string {
        // InnerText appproximates the rendered text of the element 
        // Text is just a concatenation of the text nodes. Not away of breaks etc.
        // See why you should always use innerText https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText#Result
        return this.element.innerText.replace('\n', ' ');
    }

    getElement(): HTMLElement {
        return this.element;
    }

    getSuggestions(): WBSuggestion[] {
        return writeGood(this.getText());
    }

    visit<T>(fn: (node: WBNode, prev: T[]) => T[], prev: T[]): void {
        let out = fn(this, prev);
        if (out) {
            prev.concat(out);
        }
        this.getChildren().forEach(c => {
            c.visit(fn, prev);
        });
    }

    abstract getChildren(): WBNode[];
    abstract getQuerySelector(): string;
}

export class WBDoc extends WBAbsNode {
    static QuerySelector: string = '.kix-paginateddocumentplugin';
    children: WBParagraph[] = [];

    constructor(elem: HTMLElement) {
        super();
        this.element = elem;
        // this.uniqueSelector = finder(elem, {threshold: 10}); // TODO: finder can make page freeze.
        let children: NodeListOf<Element> = this.element.querySelectorAll(WBParagraph.QuerySelector);
        children.forEach((e: Element) => {
            if ((e as HTMLElement).innerText.trim()) {
                this.children.push(new WBParagraph(e as HTMLElement));
            }
        });
    }

    static create(): WBDoc {
        return new WBDoc(document.querySelector(WBDoc.QuerySelector));
    }

    getChildren(): WBNode[] {
        return this.children;
    }

    getQuerySelector(): string {
        return WBDoc.QuerySelector;
    }
}

export class WBParagraph extends WBAbsNode {
    static QuerySelector: string = '.kix-paragraphrenderer';
    children: WBLine[] = [];

    constructor(elem: HTMLElement) {
        super();
        this.element = elem;
        // this.uniqueSelector = finder(elem);
        let children: NodeListOf<Element> = this.element.querySelectorAll(WBLine.QuerySelector);
        children.forEach((e: Element) => {
            this.children.push(new WBLine(e as HTMLElement));
        });
    }

    getChildren(): WBNode[] {
        return this.children;
    }

    getQuerySelector(): string {
        return WBParagraph.QuerySelector;
    }
}

export class WBLine extends WBAbsNode {
    static QuerySelector: string = '.kix-lineview';
    children: WBSegment[] = [];

    constructor(elem: HTMLElement) {
        super();
        this.element = elem;
        // this.uniqueSelector = finder(elem);
        let children = this.textNodes(elem);
        children.forEach((e: Element) => {
            this.children.push(new WBSegment(e.parentElement));
        });
    }

    getChildren(): WBNode[] {
        return this.children;
    }

    getQuerySelector(): string {
        return WBLine.QuerySelector;
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Element
    textNodes(node: Element): Element[] {
        if (!node) return [];
        let all: Element[] = [];
        for (node = node.firstChild as Element; node; node = node.nextSibling as Element) {
            if (node.nodeType == 3) all.push(node);
            else all = all.concat(this.textNodes(node));
        }
        return all;
    }
}

// WBSegment is the immediate parent of a text node. 
// Its only child is the text node.
export class WBSegment extends WBAbsNode {
    constructor(elem: HTMLElement) {
        super();
        this.element = elem;
        //this.uniqueSelector = finder(elem);
        if (elem.childElementCount != 1) {
            console.error(`WBSegment.constructor: segment has ${elem.childElementCount} children expected 1.`);
        }
    }

    getChildren(): WBNode[] {
        return [];
    }

    getQuerySelector(): string {
        return "return_nothing_when_used_by_accident";
    }
}

export function suggestionVisitor(node: WBNode, prev: WBSuggestion[]): WBSuggestion[] {

    const suggestions = writeGood(node.getText());
    if (suggestions.length) {
        console.log("suggestions for paragraph: ", node.getQuerySelector(), node.getUniqueSelector(), node.getText(), suggestions);
    }
    // Only add suggestion if it has not been added.
    suggestions.forEach(s => {
        if (prev.find(v => v.text == s.text)) {
            return;
        }
        prev.push(s);
    });
    return prev;
}

