import { Suggestion } from './suggestion'

/* Highlight is a DOM element that wraps a {@link Suggestion}. */
export class Highlight extends Suggestion {
    element: HTMLSpanElement;

    static of(textSegment: string, suggestion: Suggestion): Highlight {
        // create a DOM element to wrap the affected text.
        const el = document.createElement('span');
        el.innerText = textSegment.substring(suggestion.index, suggestion.index + suggestion.offset);
        el.id = Highlight.uniqueSelector();
        el.classList.add('writebetter-highlight', suggestion.type);

        return {
            index: suggestion.index,
            offset: suggestion.offset,
            reason: suggestion.reason,
            type: suggestion.type,
            element: el
        };
    }


    // Returns a pseudo random string for HTMLElement ID property.
    private static uniqueSelector(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let id = '';
        for (let i = 0; i < 20; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return 'writebetter-' + id;
    }
}