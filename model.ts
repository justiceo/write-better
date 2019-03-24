import finder from '@medv/finder';
const writeGood: (input: string) => WBSuggestion[] = require('write-good');

export class WBSuggestion {
    index: number
    offset: number
    reason: string
}

export interface WBNode {
    getQuerySelector: () => string;
    getText: () => string;
    getElement: () => HTMLElement;
    getChildren: () => WBNode[];
    getSuggestions: () => WBSuggestion[];
    visit: <T>(fn: (node: WBNode, prev: T[]) => T[], prev: T[]) => void
    propagateSuggestion: (suggestion: WBSuggestion) => void
}

export abstract class WBAbsNode implements WBNode {
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

    wrap(child: WBNode, suggestion: WBSuggestion): boolean {
        const index = this.getText().search(child.getText());
        if (index === -1) {
            console.error(`wrap: could not find child ${child.getElement().nodeName} in ${this.getElement().nodeName} with text: ${child.getText()}`);
            return false;
        }
        return suggestion.index >= index && (suggestion.index + suggestion.offset <= index + child.getText().length);
    }

    relPosition(child: WBNode, suggestion: WBSuggestion): WBSuggestion {
        if (!this.wrap(child, suggestion)) {
            throw "relPosition: cannot get relative position of suggestion that is not wrapped by node."
        }
        const index = this.getText().search(child.getText());
        return { index: suggestion.index - index, offset: suggestion.offset, reason: suggestion.reason };
    }

    propagateSuggestion(suggestion: WBSuggestion): void {
        if (this instanceof WBSegment) {
            (this as WBSegment).applySuggestion(suggestion);
            return;
        }

        let matches = this.getChildren().filter(c => this.wrap(c, suggestion));
        if (matches.length > 1) {
            console.error(`propagateSuggestion: only one child should wrap a suggestion, got ${matches.length}`);
        }
        if (matches.length == 0) {
            console.error("propagateSuggestion: no child wraipped the suggestion, potentially a cross-boundary match: ", this, suggestion);
            return;
        }
        matches[0].propagateSuggestion(this.relPosition(matches[0], suggestion));
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

    propagateSuggestions(): void {
        this.getSuggestions().forEach(s => this.propagateSuggestion(s));
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
            if ((e as HTMLElement).innerText.trim()) {
                this.children.push(new WBLine(e as HTMLElement));
            }
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
        children.forEach((e: Text) => {
            if (e.textContent) {
                this.children.push(new WBSegment(e.parentElement));
            }
        });
    }

    getChildren(): WBNode[] {
        return this.children;
    }

    getQuerySelector(): string {
        return WBLine.QuerySelector;
    }

    textNodes(el: HTMLElement): Text[] {
        const textNodes: Text[] = [];
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        let n: Node;
        while (n = walker.nextNode()) {
            textNodes.push(n as Text);
        }
        return textNodes;
    }
}

// WBSegment is the immediate parent of a text node. 
// Its only child is the text node.
export class WBSegment extends WBAbsNode {
    constructor(elem: HTMLElement) {
        super();
        this.element = elem;
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

    applySuggestion(suggestion: WBSuggestion): void {
        let selector = '';
        try {
            selector = finder(this.element, { threshold: 2 });
        } catch (err) {
            console.error(`applySuggestion: error applying suggestion: ${suggestion}; err: ${err}`);
            return;
        }
        css.innerHTML += `${selector} {
                border-bottom: 2px solid red !important;
            }`;

        console.log("applied suggestion", suggestion, "on text: ", this.getText());
    }
}

// TODO: move to a singleton
const css = insertCSS();
function insertCSS(): HTMLStyleElement {
    const css = document.createElement("style");
    css.type = "text/css";
    document.body.appendChild(css);
    return css;
}