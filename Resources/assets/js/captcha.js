import 'isomorphic-fetch';
import Captcha from "./modules/Captcha";

const captcha = new Captcha('/dist/captchaServiceWorker.js');
captcha.run(({ progress }) => {
    console.log(progress);
}).then((solution) => {
    console.log('🎉', solution);
});

