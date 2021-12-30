import 'isomorphic-fetch';
import Captcha from "./Captcha";

/**
 * Implementation of captcha that uses (isomorphic-)fetch for fetching puzzles
 */
export default class FetchCaptcha extends Captcha{

    constructor(serviceWorkerPath = '/captchaServiceWorker.js', fetchUrl = '/captcha-get') {
        super(serviceWorkerPath);
        this.fetchUrl = fetchUrl;
    }

    async fetchPuzzle() {
        const response = await fetch(this.fetchUrl);
        return await response.json();
    }
}
