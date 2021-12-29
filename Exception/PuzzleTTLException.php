<?php

namespace Unite\Captcha\Exception;

use Exception;
use Throwable;

class PuzzleTTLException extends Exception
{
    public function __construct($message = "Puzzle TTL time was exceeded.", $code = 0, Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
