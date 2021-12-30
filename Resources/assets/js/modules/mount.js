import FetchCaptcha from "./FetchCaptcha";

function findForm(el) {
    return el.tagName === 'FORM' ? el : (el.parentElement ? findForm(el.parentElement) : null);
}

function runCaptcha(captcha, form, captchaProgress, captchaSolved, captchaProgressText, submitButton, input) {

    input.value = '';

    if(submitButton) {
        submitButton.disabled = true;
    }

    if (captchaProgress) {
        captchaProgress.style.display = 'block';
    }

    if (captchaSolved) {
        captchaSolved.style.display = 'none';
    }

    captcha.run(({progress}) => {
        if (captchaProgress) {
            captchaProgress.dispatchEvent(new CustomEvent('captchaProgress', {detail: {progress}}));
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
            captchaProgress.style.display = 'none';
        }
        if (captchaSolved) {
            captchaSolved.style.display = 'block';
        }

        // Set timeout for one second before TTL expires.
        const expiredTime = solution.puzzle.timestamp + solution.puzzle.TTL;
        const remainingTime = expiredTime - Math.round(Date.now() / 1000) - 1;
        setTimeout(() => {
            runCaptcha(captcha, form, captchaProgress, captchaSolved, captchaProgressText, submitButton, input);
        }, remainingTime * 1000);
    });
}

export default function(root = document) {
    root.querySelectorAll('input[data-captcha]').forEach((input) => {
        const form = findForm(input);
        if(form) {
            input.value = '';
            const submitButton = form.querySelector('button[type="submit"]');
            if(submitButton) {
                submitButton.disabled = true;
            }
            const captchaProgress = form.querySelector('[data-captcha-progress]');
            if (captchaProgress) {
                captchaProgress.style.display = 'none';
            }

            const captchaSolved = form.querySelector('[data-captcha-solved]');
            if (captchaSolved) {
                captchaSolved.style.display = 'none';
            }

            const captchaProgressText = form.querySelector('[data-captcha-progress-text]');
            const config = JSON.parse(input.dataset.captcha);
            const captcha = new FetchCaptcha(config.serviceWorkerUrl, config.fetchUrl);

            form.querySelectorAll('*').forEach((el) => {
                el.addEventListener('focus', () => {
                    if (!form.captchaStarted) {
                        form.captchaStarted = true;
                        runCaptcha(captcha, form, captchaProgress, captchaSolved, captchaProgressText, submitButton, input);
                    }
                });
            });
        }
    });
}

