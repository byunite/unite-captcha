/**
 * Registers a service worker and let it solve a captcha puzzle
 */
export default class Captcha {

    constructor(serviceWorkerPath = 'captchaServiceWorker.js', fetchUrl = '/captcha-get', checkUrl = '/captcha-check') {
        this.fetchUrl = fetchUrl;
        this.checkUrl = checkUrl;
        this.registerServiceWorker(serviceWorkerPath);
    }

    registerServiceWorker(serviceWorkerPath) {

        if(this.serviceWorker) {
            return;
        }

        this.serviceWorker = new Worker(serviceWorkerPath)
        this.serviceWorker.addEventListener('message', (e) => {
            const { data } = e;
            switch (data.cmd) {
                case 'solution':
                    this.solveResolve(data.args);
                    break;
                case 'error':
                    this.solveReject(data.args);
                    break;
                case 'progress':
                    if(this.onProgressCallback) {
                        this.onProgressCallback({
                            ...data.args,
                            duration: performance.now() - this.solveStartTime
                        })
                    }
                    break;
                default:
                    console.log(data);
                    break;
            }
        });
    }

    async run(onProgressCallback = () => {}) {
        this.solveStartTime = performance.now();
        this.attemptCount = 0;
        this.onProgressCallback = onProgressCallback;
        const solution = await this.internalRun();
        return {
            ...solution,
            attempts: this.attemptCount,
            duration: performance.now() - this.solveStartTime,
        };
    }

    async internalRun() {
        this.attemptCount++;
        const { timestamp, targetHash, puzzle, puzzleStrength } = await this.fetchPuzzle();
        try {
            return await this.solve(timestamp, targetHash, puzzle, puzzleStrength);
        } catch (error) {
            return this.internalRun();
        }
    }

    async fetchPuzzle() {
        const response = await fetch(this.fetchUrl);
        return await response.json();
    }

    async checkPuzzle() {
        const response = await fetch(this.checkUrl);
        return await response.json();
    }

    async solve(timestamp, targetHash, puzzle, puzzleStrength) {
        if(!this.serviceWorker) {
            throw 'ServiceWorker not initialized!';
        }

        return new Promise((resolve, reject) => {
            this.solveResolve = resolve;
            this.solveReject = reject;
            this.serviceWorker.postMessage({
                cmd: 'start',
                args: { timestamp, targetHash, puzzle, puzzleStrength },
            });
        });
    }
}
