import { Style } from './style';
import { Log } from '../shared/log';
import { Suggestion } from './suggestion';
import { Editor } from './editor';
const writeGood: (input: string) => Suggestion[] = require('write-good');
type xNode = Node;

const TAG = 'model.ts';
export namespace Model {

    export interface Node {
        getText: () => string;
        getElement: () => HTMLElement;
        getChildren: () => Node[];
        getSuggestions: () => Promise<Suggestion[]>;
        propagateSuggestions: (...suggestions: Suggestion[]) => void;
    }

    export abstract class AbsNode implements Node {
        element: HTMLElement;
        editor: Editor;
        static cache: Map<string, Suggestion[]> = new Map();

        constructor(elem: HTMLElement, editor: Editor) {
            this.element = elem;
            this.editor = editor;
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

            // Force clear cache. TODO: Be systematic about it, oldest first.
            if (AbsNode.cache.size > 500) {
                AbsNode.cache.clear()
            }

            if (AbsNode.cache.has(text)) {
                return Promise.resolve(AbsNode.cache.get(text))
            }
            AbsNode.cache.set(text, writeGood(text));
            return Promise.resolve(AbsNode.cache.get(text));
        }

        abstract getChildren(): Node[];
        abstract propagateSuggestions(...suggestions: Suggestion[]): void;
    }

    export class Doc extends AbsNode {
        static PreviousText: string = null;

        getChildren(): Node[] {
            let children: Paragraph[] = [];
            this.element.querySelectorAll(this.editor.getParagraphSelector()).forEach((e: Element) => {
                if ((e as HTMLElement).innerText.trim()) {
                    children.push(new Paragraph(e as HTMLElement, this.editor));
                }
            });
            return children;
        }

        propagateSuggestions(..._: Suggestion[]) {
            if (this.getText() == Doc.PreviousText) {
                return;
            }
            Doc.PreviousText = this.getText();

            const t1 = performance.now();
            this.getChildren().forEach(c => c.propagateSuggestions());
            Log.debug(TAG, "Re-analyzed whole doc in ", performance.now() - t1, "ms");
        }
    }

    export class Paragraph extends AbsNode {

        getChildren(): Node[] {
            let children: Line[] = [];
            this.element.querySelectorAll(this.editor.getLineSelector()).forEach((e: Element) => {
                if ((e as HTMLElement).innerText.trim()) {
                    children.push(new Line(e as HTMLElement, this.editor));
                }
            });
            return children;
        }

        async propagateSuggestions(...suggestions: Suggestion[]) {
            const paragraphSuggestions = await this.getSuggestions();
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

        getChildren(): Node[] {
            let children: Segment[] = [];
            Line.textNodes(this.element).forEach((e: Text) => {
                if (e.textContent.trim()) {
                    children.push(new Segment(e.parentElement, this.editor));
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

        getChildren(): Node[] {
            Log.error(TAG, 'Segment.getChildren: segment should be treated as a leaf');
            return [];
        }

        propagateSuggestions(...suggestions: Suggestion[]) {
            if (this.element.querySelector('span.writebetter-highlight') || this.element.classList.contains('writebetter-highlight')) {
                return;
            }
            Style.getInstance().highlight(this, suggestions);
        }
    }
}