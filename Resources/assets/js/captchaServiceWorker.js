
// Listen to events from main script.
import PuzzleSolver from "./modules/PuzzleSolver";

const puzzleSolver = new PuzzleSolver(self);

self.addEventListener('message', function(e) {
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
