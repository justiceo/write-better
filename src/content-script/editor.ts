import { Model } from "./model";

export abstract class Editor {    
    abstract getDocumentSelector(): string;
    abstract getParagraphSelector(): string;
    abstract getLineSelector(): string;

    isApplicable(): boolean {
        return this.getDocument() != null;
    }

    analyzeText(): void {
        new Model.Doc(this.getDocument(), this).propagateSuggestions();
    }

    getDocument(): HTMLElement {
        return document.querySelector(this.getDocumentSelector());
    }
}

class GoogleDocs extends Editor {

    private static _instance: GoogleDocs;
    static instance(): Editor {
        return this._instance || (this._instance = new this());
    }

    getDocumentSelector(): string {
        return '.kix-paginateddocumentplugin';
    }

    getParagraphSelector(): string {
        return ':scope .kix-paragraphrenderer';
    }

    getLineSelector(): string {
        return ':scope .kix-lineview';
    }
}

export const getEditor = () => {
    const editor = GoogleDocs.instance().isApplicable() && GoogleDocs.instance();
    // || other editors here.
    return editor;
}