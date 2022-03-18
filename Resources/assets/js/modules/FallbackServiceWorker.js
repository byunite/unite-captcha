import PuzzleSolver from "./PuzzleSolver";

export default class FallbackServiceWorker {
    constructor() {
        this.listeners = {};
        const puzzleSolver = new PuzzleSolver(this, true);
        this.addEventListener('message', function(e) {
            const { data } = e;
            switch (data.cmd) {
                case 'start':
                    const {
                        timestamp,
                        targetHash,
                        puzzle,
                        puzzleStrength,
                    } = data.args;
                    puzzleSolver.solve(timestamp, targetHash, puzzle, puzzleStrength);
                    break;
            }
        }, false);
    }
    addEventListener(message, func) {
        this.listeners[message] = this.listeners[message] || [];
        this.listeners[message].push(func);
    }
    postMessage(message) {
        this.listeners.message.forEach((l) => {
            l({data: message});
        });
    }
}
