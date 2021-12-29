import Captcha from "./modules/Captcha";

const captcha = new Captcha('/dist/captchaServiceWorker.js');
captcha.solve(1640797286, '541457e130c3243dec6cfdd80dd1a329995eda8f81f207c175a2ffcb40917616', 'c3ae8499246cc17ab13f19ad3f71f7363d33ed339e4bbe6b918fcb4a6af0', 17).then((solution) => {
    console.log(solution);
});

