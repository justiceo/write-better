import { WriteBetterUI } from './ui';
import { Log } from '../shared/shared';
const writeGood: (input: string) => WriteBetter.Suggestion[] = require('write-good');
type xNode = Node;

const TAG = 'model.ts';
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
        getSuggestions: () => Promise<Suggestion[]>;
        propagateSuggestions: (...suggestions: Suggestion[]) => void;
        visit: <T>(fn: (node: Node, prev: T[]) => T[], prev: T[]) => void
    }

    export abstract class AbsNode implements Node {
        element: HTMLElement;

        constructor(elem: HTMLElement) {
            this.element = elem;
        }

        getText(): string {
            // InnerText appproximates the rendered text of the element 
            // Text is just a concatenation of the text nodes. Not away of breaks etc.
            // See why you should always use innerText https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText#Result
            return this.element.innerText;
        }

        getElement(): HTMLElement {
            return this.element;
        }

        async getSuggestions(): Promise<Suggestion[]> {
            let text = this.getText(); 
            if (text.replace(/\u200C/g, '').trim().length == 0) { // Necessary to replace zero-width non-joiner
                return Promise.resolve([])
            }       
            return Promise.resolve( writeGood(text));
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
        abstract propagateSuggestions(...suggestions: Suggestion[]): void;
    }

    export class Doc extends AbsNode {
        static QuerySelector: string = '.kix-paginateddocumentplugin';

        constructor() {
            super(document.querySelector(Doc.QuerySelector));
        }

        getChildren(): Node[] {
            let children: Paragraph[] = [];
            this.element.querySelectorAll(Paragraph.QuerySelector).forEach((e: Element) => {
                if ((e as HTMLElement).innerText.trim()) {
                    children.push(new Paragraph(e as HTMLElement));
                }
            });
            return children;
        }

        propagateSuggestions(..._: Suggestion[]) {
            // For page performance reasons, ignore large documents.
            if (this.getText().length > 4000) {
                Log.debug(TAG, "Document too large. Character count:", this.getText().length);
                return;
            }
            this.getChildren().forEach(c => c.propagateSuggestions());
        }
    }

    export class Paragraph extends AbsNode {
        static QuerySelector: string = ':scope .kix-paragraphrenderer';

        getChildren(): Node[] {
            let children: Line[] = [];
            this.element.querySelectorAll(Line.QuerySelector).forEach((e: Element) => {
                if ((e as HTMLElement).innerText.trim()) {
                    children.push(new Line(e as HTMLElement));
                }
            });
            return children;
        }

        async propagateSuggestions(...suggestions: Suggestion[]) {
            const paragraphSuggestions = await this.getSuggestions();
            // Cut the CPU some slack in case the above operation hit too hard (think large paragraphs).
            await new Promise(resolve => setTimeout(resolve, 50));
            suggestions.push(...paragraphSuggestions);
            this.getChildren().forEach(c => {
                const childSuggestions: Suggestion[] = []
                suggestions.forEach(s => {
                    // TODO: need to handle case when there are multiple matches.
                    const index = this.getText().indexOf(c.getText(), 0);
                    if (index === -1) {
                        console.warn(`propagateSuggestions: could not find child ${c.getElement().nodeName} in ${this.getElement().nodeName} with text: ${c.getText()}`);
                        return;
                    }
                    if (s.index >= index && (s.index + s.offset <= index + c.getText().length)) {
                        childSuggestions.push({ index: s.index - index, offset: s.offset, reason: s.reason });
                    }
                });
                if (childSuggestions.length > 0) {
                    c.propagateSuggestions(...childSuggestions);
                }
            });
        }
    }

    export class Line extends AbsNode {
        static QuerySelector: string = ':scope .kix-lineview';

        getChildren(): Node[] {
            let children: Segment[] = [];
            Line.textNodes(this.element).forEach((e: Text) => {
                if (e.textContent.trim()) {
                    children.push(new Segment(e.parentElement));
                }
            });
            return children;
        }

        propagateSuggestions(...suggestions: Suggestion[]) {
            this.getChildren().forEach(c => {
                const childSuggestions: Suggestion[] = []
                suggestions.forEach(s => {
                    // TODO: need to handle case when there are multiple matches.
                    const index = this.getText().indexOf(c.getText(), 0);
                    if (index === -1) {
                        console.warn(`propagateSuggestions: could not find child ${c.getElement().nodeName} in ${this.getElement().nodeName} with text: ${c.getText()}`);
                        return;
                    }
                    if (s.index >= index && (s.index + s.offset <= index + c.getText().length)) {
                        childSuggestions.push({ index: s.index - index, offset: s.offset, reason: s.reason });
                    }
                });
                if (childSuggestions.length > 0) {
                    c.propagateSuggestions(...childSuggestions);
                }
            });
        }

        static textNodes(el: HTMLElement): Text[] {
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
    // It may have multiple text and element nodes under it.
    export class Segment extends AbsNode {
        highlights: WriteBetterUI.Highlight[] = [];

        getChildren(): Node[] {
            Log.error(TAG, 'Segment.getChildren: segment should be treated as a leaf');
            return [];
        }

        propagateSuggestions(...suggestions: Suggestion[]) {
            if (this.element.querySelector('span.writebetter-highlight') || this.element.classList.contains('writebetter-highlight')) {
                return;
            }
            this.highlights = suggestions.map(s => WriteBetterUI.Highlight.of(this, s));
            WriteBetterUI.Style.getInstance().highlight(this);
        }
    }
}