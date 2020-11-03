// Simple util for logging to console.
// Ensure output level is set to 'verbose' to see debug logs.
export class Log {
    static debugMode = true;

    static debug(tag: string, ...logs: any[]) {
        if (!this.debugMode) {
            return;
        }
        const d = new Date(Date.now());
        console.debug("%c%s %s", "color: blue", `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}]`, tag, ...logs);
    }

    static error(tag: string, ...logs: any[]) {
        if (!this.debugMode) {
            return;
        }
        const d = new Date(Date.now());
        console.debug("%c%s %s", "color: red", `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}]`, tag, ...logs);
    }
}