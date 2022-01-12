import FetchCaptcha from "./FetchCaptcha";

function findForm(el) {
    return el.tagName === 'FORM' ? el : (el.parentElement ? findForm(el.parentElement) : null);
}

function runCaptcha(captcha, form, captchaPlaceholder, captchaProgress, captchaSolved, captchaProgressText, captchaProgressBar, submitButton, input) {

    input.value = '';

    if(submitButton) {
        submitButton.disabled = true;
    }

    if(captchaPlaceholder) {
        captchaPlaceholder.classList.remove('visible');
    }

    if (captchaProgress) {
        captchaProgress.classList.add('visible');
    }

    if (captchaSolved) {
        captchaSolved.classList.remove('visible');
    }

    if (captchaProgressBar) {
        captchaProgressBar.classList.remove('done');
        captchaProgressBar.classList.add('progress');
        captchaProgressBar.parentElement.style.setProperty('--captcha-progress', `${0}%`);
    }

    captcha.run(({progress}) => {
        if(captchaProgressBar) {
            captchaProgressBar.parentElement.style.setProperty('--captcha-progress', `${progress}%`);
        }
        if (captchaProgressText) {
            captchaProgressText.innerText = `${progress}%`;
        }
    }).then((solution) => {
        input.value = JSON.stringify({...solution.puzzle, solution: solution.solution});
        if (submitButton) {
            submitButton.disabled = false;
        }
        if (captchaProgress) {
            captchaProgress.classList.remove('visible');
        }

        if(captchaProgressBar) {
            captchaProgressBar.parentElement.style.setProperty('--captcha-progress', '100%');
            captchaProgressBar.classList.remove('progress');
            captchaProgressBar.classList.add('done');
        }

        if (captchaProgressText) {
            captchaProgressText.innerText = '100%';
        }
        if (captchaSolved) {
            captchaSolved.classList.add('visible');
        }

        // Set timeout for one second before TTL expires.
        const expiredTime = solution.puzzle.timestamp + solution.puzzle.TTL;
        const remainingTime = expiredTime - Math.round(Date.now() / 1000) - 1;
        setTimeout(() => {
            runCaptcha(captcha, form, captchaPlaceholder, captchaProgress, captchaSolved, captchaProgressText, captchaProgressBar, submitButton, input);
        }, remainingTime * 1000);
    });
}

export default function(root = document) {
    root.querySelectorAll('input[data-captcha]').forEach((input) => {
        const form = findForm(input);
        if(form) {
            input.value = '';

            const submitButton = form.querySelector('button[type="submit"]');
            const captchaPlaceholder = form.querySelector('[data-captcha-placeholder]');
            const captchaProgress = form.querySelector('[data-captcha-progress]');
            const captchaSolved = form.querySelector('[data-captcha-solved]');
            const captchaProgressText = form.querySelector('[data-captcha-progress-text]');
            const captchaProgressBar = form.querySelector('[data-captcha-progress-bar]');
            const config = JSON.parse(input.dataset.captcha);
            const captcha = new FetchCaptcha(config.serviceWorkerUrl, config.fetchUrl);

            if(submitButton) {
                submitButton.disabled = true;
            }

            if(captchaPlaceholder) {
                captchaPlaceholder.classList.add('visible');
            }

            form.querySelectorAll('*').forEach((el) => {
                el.addEventListener('focus', () => {
                    if (!form.captchaStarted) {
                        form.captchaStarted = true;
                        runCaptcha(captcha, form, captchaPlaceholder, captchaProgress, captchaSolved, captchaProgressText, captchaProgressBar, submitButton, input);
                    }
                });
            });
        }
    });
}

