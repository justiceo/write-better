// Represents a single suggestion returned by grammatical linters.
export class Suggestion {
    index: number
    offset: number
    reason: string
}