import { Sha256 } from '@aws-crypto/sha256-browser'

export default class PuzzleSolver {

    constructor(messageBus = null) {
        this.messageBus = messageBus || { postMessage() {} };
    }

    async hash(str) {

        let hasWideChar = false;

        for(let i = 0; i < str.length; i++ ){
            if ( str.charCodeAt(i) >>> 8 ) {
                hasWideChar = true;
                break;
            }
        }

        const hash = new Sha256();
        hash.update(str);
        return Array.prototype.map.call((await hash.digest()), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    postMessage(cmd, args = {}) {
        this.messageBus.postMessage({ cmd, args });
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
            const iHash = await this.hash(iCandidate);

            if (iHash === pTargetHash) {
                this.postMessage('solution', { solution: iCandidate });
                return;
            }
        }

        this.postMessage('error', { message: 'No solution found.' });
    }
}
