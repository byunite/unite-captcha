<?php

namespace Unite\Captcha\Exception;

use Exception;
use Throwable;

class InvalidPuzzleTargetHashException extends Exception
{
    public function __construct($message = "The puzzle target hash is invalid for this generator.", $code = 0, Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
