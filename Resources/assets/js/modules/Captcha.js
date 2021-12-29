/**
 * Registers a service worker and let it solve a captcha puzzle
 */
export default class Captcha {

    constructor(serviceWorkerPath = 'captchaServiceWorker.js') {
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
                default:
                    console.log(data);
                    break;
            }
        });
    }

    async solve(timeStamp, targetHash, puzzle, puzzleStrength) {
        if(!this.serviceWorker) {
            throw 'ServiceWorker not initialized!';
        }

        return new Promise((resolve, reject) => {
            this.solveResolve = resolve;
            this.solveReject = reject;

            this.serviceWorker.postMessage({
                cmd: 'start',
                args: {
                    timeStamp,
                    targetHash,
                    puzzle,
                    puzzleStrength,
                },
            });
        });
    }
}
