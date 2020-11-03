// Write-good is the only dependency of this extension.
// This test ensures the library fulfills its promises (e.g. after an update). 
const writeGood = require('write-good');

describe('write-good', () => {
    it('identifies passive sentences', () => {
        let suggestions = writeGood("The goat was killed by the man");
        expect(suggestions.length).toBe(1);

        let suggestion = suggestions[0];
        expect(suggestion.reason).toBe('"was killed" may be passive voice', "Reason mismatch");        
        expect(suggestion.index).toBe(9, "Index mismatch");
        expect(suggestion.offset).toBe(10, "Offset mismatch");
    });

    it('identifies adverbs that weaken meaning', () => {
        let suggestions = writeGood("He was really happy to get the job.");
        expect(suggestions.length).toBe(1);

        let suggestion = suggestions[0];
        expect(suggestion.reason).toBe('"really" can weaken meaning', "Reason mismatch");        
        expect(suggestion.index).toBe(7, "Index mismatch");
        expect(suggestion.offset).toBe(6, "Offset mismatch");
    });

    it('identifies lexical illusions', () => {
        let suggestions = writeGood(`Some people are not aware that the
        the brain will automatically ignore
        a second instance of the word 'the'
        when it starts a new line.`);
        expect(suggestions.length).toBe(1);

        let suggestion = suggestions[0];
        expect(suggestion.reason).toBe('"the" is repeated', "Reason mismatch");        
        expect(suggestion.index).toBe(43, "Index mismatch");
        expect(suggestion.offset).toBe(3, "Offset mismatch");
    });

    it('identifies "so" at begining of sentence', () => {
        let suggestions = writeGood("He slapped me. So I slapped him back.");
        expect(suggestions.length).toBe(1);

        let suggestion = suggestions[0];
        expect(suggestion.reason).toBe('"So" adds no meaning', "Reason mismatch");        
        expect(suggestion.index).toBe(15, "Index mismatch");
        expect(suggestion.offset).toBe(2, "Offset mismatch");
    });

    it('identifies "there is" at begining of sentence', () => {
        let suggestions = writeGood("There is a dog in the house.");
        expect(suggestions.length).toBe(1);

        let suggestion = suggestions[0];
        expect(suggestion.reason).toBe('"There is" is unnecessary verbiage', "Reason mismatch");        
        expect(suggestion.index).toBe(0, "Index mismatch");
        expect(suggestion.offset).toBe(8, "Offset mismatch");
    });

    it('identifies weasel words', () => {
        let suggestions = writeGood("I ate many cookies today.");
        expect(suggestions.length).toBe(1);

        let suggestion = suggestions[0];
        expect(suggestion.reason).toBe('"many" is a weasel word and can weaken meaning', "Reason mismatch");        
        expect(suggestion.index).toBe(6, "Index mismatch");
        expect(suggestion.offset).toBe(4, "Offset mismatch");
    });

    it('identifies wordy phrases', () => {
        let suggestions = writeGood("You can utilize a shorter word in place of a purple one.");
        expect(suggestions.length).toBe(1);

        let suggestion = suggestions[0];
        expect(suggestion.reason).toBe('"utilize" is wordy or unneeded', "Reason mismatch");        
        expect(suggestion.index).toBe(8, "Index mismatch");
        expect(suggestion.offset).toBe(7, "Offset mismatch");
    });

    it('identifies cliches', () => {
        let suggestions = writeGood("It goes without saying that amber identifies idioms, which we discourage.");
        expect(suggestions.length).toBe(1);

        let suggestion = suggestions[0];
        expect(suggestion.reason).toBe('"It goes without saying" is a cliche', "Reason mismatch");        
        expect(suggestion.index).toBe(0, "Index mismatch");
        expect(suggestion.offset).toBe(22, "Offset mismatch");
    });

    it('identifies e-primes', () => {
        let suggestions = writeGood("Blessed are the poor in spirit.", {eprime: true});
        expect(suggestions.length).toBe(1);

        let suggestion = suggestions[0];
        expect(suggestion.reason).toBe(`"are" is a form of 'to be'`, "Reason mismatch");        
        expect(suggestion.index).toBe(8, "Index mismatch");
        expect(suggestion.offset).toBe(3, "Offset mismatch");
    });

    // TODO: Add known-edge cases here.
});