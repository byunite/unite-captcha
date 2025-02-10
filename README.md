# Unite Captcha

Custom crypto-puzzle-captcha implementation (JS / PHP)

(by Sascha Fruehwirth and Franz Wilding)

## Installation (composer)


```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/unite-cms/crypto-captcha"
        }
    ],
    ...
}


```shell
composer require unite/captcha
yarn add link:./vendor/unite/captcha 
```

## 1. Getting started SERVER

### 1.1 Implement an HTTP endpoint to fetch new puzzles
You will need an HTTP endpoint that will return the puzzle to the client. Here is an example for a Symfony controller:
```php
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Unite\Captcha\Generator\Puzzle;

class CaptchaController extends AbstractController
{
    #[Route('/captcha-get-puzzle', name: 'get_captcha')]
    public function getCaptcha(string $captchaSecret) : Response {
        $captcha = new Captcha($captchaSecret);
        return $this->json($captcha->createPuzzle());
    }
}
```

### 1.2 Add a special captcha form input element
So secure the form you need to add a special captcha input element ("data-captcha") and optional status indicators 
("data-captcha-progress", "data-captcha-progress-text", "data-captcha-solved"): 
```html
<form>
    ...
    <input type="hidden" name="_captcha" data-captcha="{&quot;serviceWorkerUrl&quot;:&quot;\/dist\/captchaServiceWorker.js&quot;,&quot;fetchUrl&quot;:&quot;\/captcha-get-puzzle&quot;}" />
    <div class="unite-captcha">
            <span data-captcha-placeholder>
                🔒 Automatisches Captcha
            </span>
        <span data-captcha-progress>
                ⌛️️ Captcha wird gelöst... <small>(<span data-captcha-progress-text></span>)</small>
            </span>
        <span data-captcha-solved>
                ✅ Captcha bestanden
            </span>
        <span data-captcha-progress-bar></span>
    </div>
    ...
</form>
```
The captcha config must contain the fetchUrl and can optionally contain the url to the service-worker script.

### 1.3 Validating the captcha, once the form was submitted
In order to validate the captcha you need to check the solution that was created by the client. Here is a Symfony 
reference implementation:
```php
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Unite\Captcha\Generator\Puzzle;

class FormController extends AbstractController
{
    #[Route('/contact', name: 'contact')]
    public function contact(Request $request, string $captchaSecret) : Response {
        $captcha = new Captcha($captchaSecret);
        $form = $this->createForm(...);
        
        $form->handleRequest($request);
        if($form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();
            $captchaData = json_decode($data['captcha']);
            $puzzle = Puzzle::fromData($captchaData);
            try {
                if (!$captcha->checkPuzzle($puzzle, $captchaData->solution)) {
                    $form->addError(new FormError('Invalid Captcha!'));
                }
            } catch (InvalidPuzzleTargetHashException $e) {
                $form->addError(new FormError('Invalid Captcha target hash!'));
            } catch (PuzzleTTLException $e) {
                $form->addError(new FormError('Captcha TTL expired!'));
            }
        }
        
        ...
    }
}
```

## 2. Getting started CLIENT

### 2.1 Option A: Include the compiled and minified js module
Inside this bundle you will find two compiled and minified js scripts (`dist/captcha.js` and `dist/captchaServiceWorker.js`). 

Include the `dist/captcha.js` script AFTER all forms you want to secure (e.g. just before the body end tag) and make 
sure, that the `dist/captchaServiceWorker.js` script is accessible via HTTP (in 1.2 you can see how to modify the 
service worker path):
````html
<script src="/dist/captcha.js"></script>
<link rel="stylesheet" href="/dist/captcha.css" />
````

### 2.1 Option B: Import the ES6 modules into your custom js logic (vue, react whatever) 
````js
import '@unite/captcha/dist/captcha.css'
import { FetchCaptcha, Captcha } from "@unite/captcha";


/* 
 * Captcha is an abscract class that allows you to implement custom logic for 
 * fetching a new puzzle.
 */
export default class MyCaptcha extends Captcha {
    async fetchPuzzle() {
        // return await graphQLResonse...
    }
}

/*
 * FetchCaptcha is the default implementation, using (isomorphic-) fetch to 
 * fetch new puzzles. This class will be used in the compiled captcha.js script.
 */
const captcha = new FetchCaptcha(serviceWorkerUrl, fetchUrl);
const solution = await captcha.run(({ progress }) => {
    // console.log(`Solving: ${progress}%`);
});

````

### 2.2 Custom styling and markup
You can customize the captcha widget by overriding on of the following css variables: 
```css
.unite-captcha {
    --captcha-widget-background: rgba(0,0,0,0.025);
    --captcha-widget-border: rgba(0,0,0,0.25);
    --captcha-progress-bar: rgba(0,0,0,0.5);
    --captcha-progress-bar-done: #00C30D;
}
```
or by providing custom styling instead of including the captcha.css file.

You can also customize the markup in every way: The default captcha module will look for elements with the specific data 
attributes and will update classes and css variables.
