import forge from 'node-forge';

export default class PuzzleSolver {

    constructor(serviceWorkerInstance) {
        this.serviceWorkerInstance = serviceWorkerInstance;
        this.hash = forge.md.sha512.sha256.create();
    }

    postMessage(cmd, args = {}) {
        this.serviceWorkerInstance.postMessage({ cmd, args });
    }

    async solve(pTimestamp, pTargetHash, pPuzzle, pPuzzleStrength) {

        const iBitsMissing = Math.floor(pPuzzleStrength/4);
        const iZeros = '0'.repeat(iBitsMissing);
        const iFullBitMask = (1<<(iBitsMissing*4))-1;
        const iPartialBits = parseInt("0x" + pPuzzle.substr(pPuzzle.length-1,1), 16);
        const iLeftPuzzleSolution = pPuzzle.substr(0,pPuzzle.length-1);
        const maxTries = (1 << pPuzzleStrength);

        let progress = 0;
        let oldProgress = 0;

        for (let i = 0; i < maxTries; ++i) {

            progress = Math.round(((i+1) / maxTries) * 100);
            if(progress !== oldProgress) {
                this.postMessage('progress', { progress });
            }
            oldProgress = progress;

            const iMask = i&iFullBitMask;
            const iBitsToAppend = (iZeros + iMask.toString(16)).slice(-iBitsMissing);
            const iBitsMiddle = (iPartialBits + (i >> (iBitsMissing<<2))).toString(16);
            const iCandidate = iLeftPuzzleSolution + iBitsMiddle + iBitsToAppend;

            const iHash = this.hash.update(iCandidate).digest().toHex();

            if (iHash === pTargetHash) {
                this.postMessage('solution', { solution: iHash });
                return;
            }
        }

        this.postMessage('error', { message: 'No solution found.' });
    }
}
