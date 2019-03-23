import finder from '@medv/finder';
const writeGood: (input: string) => WBSuggestion[] = require('write-good');

class WBSuggestion {
    start: number
    offset: number
    text: string
}

interface WBNode {
    getUniqueSelector: () => string;
    getQuerySelector: () => string;
    getText: () => string;
    getElement: () => HTMLElement;
    getChildren: () => WBNode[];
    getSuggestions: () => WBSuggestion[];
    visit: <T>(fn: (node: WBNode, prev: T[]) => T[], prev: T[]) => void
}

class WBAbsNode implements WBNode {
    uniqueSelector: string;
    text: string;
    element: HTMLElement;
    suggestions: WBSuggestion[];

    getUniqueSelector(): string {
        return this.uniqueSelector;
    }

    getText(): string {
        // TODO: this.text should always be equal to this.element.textContent
        // What do we do when it's not?
        if (this.text !== this.element.textContent) {
            console.error(`Element text:${this.text} \nnot same as textContent: ${this.element.textContent}`);
        }
        return this.text;
    }

    getElement(): HTMLElement {
        return this.element;
    }

    getChildren(): WBNode[] {
        // Todo: throw unimplemented exception or make abstract
        return null;
    }
    getQuerySelector(): string {
        // Todo: throw unimplemented exception or make abstract
        return null;
    }

    getSuggestions(): WBSuggestion[] {
        return this.suggestions;
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
}

class WBDoc extends WBAbsNode {
    static QuerySelector: string = 'kix-document';
    children: WBParagraph[] = [];

    constructor(elem: HTMLElement) {
        super();
        this.element = elem;
        this.uniqueSelector = finder(elem);
        this.text = elem.textContent;
        let children: NodeListOf<Element> = document.querySelectorAll(WBParagraph.QuerySelector);
        children.forEach((e: Element) => {
            this.children.push(new WBParagraph(e as HTMLElement));
        });
    }

    getChildren(): WBNode[] {
        return this.children;
    }

    getQuerySelector(): string {
        return WBDoc.QuerySelector;
    }
}

class WBParagraph extends WBAbsNode {
    static QuerySelector: string = 'kix-paragraph';
    children: WBLine[] = [];

    constructor(elem: HTMLElement) {
        super();
        this.element = elem;
        this.uniqueSelector = finder(elem);
        this.text = elem.textContent;
        let children: NodeListOf<Element> = document.querySelectorAll(WBLine.QuerySelector);
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

class WBLine extends WBAbsNode {
    static QuerySelector: string = 'kix-line';
    children: WBSegment[] = [];

    constructor(elem: HTMLElement) {
        super();
        this.element = elem;
        this.uniqueSelector = finder(elem);
        this.text = elem.textContent;
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
class WBSegment extends WBAbsNode {
    constructor(elem: HTMLElement) {
        super();
        this.element = elem;
        this.uniqueSelector = finder(elem);
        this.text = elem.textContent;
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

function suggestionVisitor(node: WBNode, prev: WBSuggestion[]): WBSuggestion[] {
    if (node! instanceof WBParagraph && node! instanceof WBLine) {
        return prev
    }
    const suggestions = writeGood(node.getText());
    // Only add suggestion if it has not been added.
    suggestions.forEach(s => {
        if (prev.find(v => v.text == s.text)) {
            return;
        }
        prev.push(s);
    });
    return prev;
}

