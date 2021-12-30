
/**
 * Registers a service worker and let it solve a captcha puzzle
 */
export default class Captcha {

    constructor(serviceWorkerPath = 'captchaServiceWorker.js') {
        this.registerServiceWorker(serviceWorkerPath);
    }

    async fetchPuzzle() {
        throw 'Needs to be implemented!';
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
            puzzle: this.puzzle,
            attempts: this.attemptCount,
            duration: performance.now() - this.solveStartTime,
        };
    }

    async internalRun() {
        this.attemptCount++;
        this.puzzle = await this.fetchPuzzle();
        try {
            return await this.solve();
        } catch (error) {
            return this.internalRun();
        }
    }

    async solve() {
        if(!this.serviceWorker) {
            throw 'ServiceWorker not initialized!';
        }

        return new Promise((resolve, reject) => {
            this.solveResolve = resolve;
            this.solveReject = reject;
            this.serviceWorker.postMessage({
                cmd: 'start',
                args: this.puzzle,
            });
        });
    }
}
