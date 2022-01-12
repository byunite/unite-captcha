<?php

namespace Unite\Captcha\Generator;

use Unite\Captcha\Exception\InvalidPuzzleTargetHashException;
use Unite\Captcha\Exception\PuzzleTTLException;

class Captcha
{
    private string $secret;
    private int $strength;
    private int $TTL;

    public function __construct(string $secret, int $strength = 17, int $TTL = 60)
    {
        $this->secret = $secret;
        $this->strength = $strength;
        $this->TTL = $TTL;
    }

    protected function hash(string $data) : string {
        return hash('sha256', $data);
    }

    /**
     * @return Puzzle
     */
    public function createPuzzle() : Puzzle {
        $timestamp = time();
        $tPuzzleHash = $this->hash($timestamp . $this->secret);
        $tIndexLastByte = strlen($tPuzzleHash) - floor($this->strength / 4) - 1;
        $tPuzzle = substr($tPuzzleHash, 0, $tIndexLastByte);
        $tLastCharOfPuzzle = hexdec(substr($tPuzzleHash, $tIndexLastByte, 1));
        $tBitsToMask = $this->strength % 4;
        $tMaskedLastCharOfPuzzle = $tLastCharOfPuzzle & ~((1 << $tBitsToMask) - 1);

        $tPuzzle = $tPuzzle . base_convert($tMaskedLastCharOfPuzzle, 10, 16);
        $targetHash = $this->hash($tPuzzleHash);
        return new Puzzle($timestamp, $tPuzzle, $this->strength, $targetHash, $this->TTL);
    }

    /**
     * @param Puzzle $puzzle
     * @param string $solution
     * @return bool
     * @throws PuzzleTTLException
     * @throws InvalidPuzzleTargetHashException
     */
    public function checkPuzzle(Puzzle $puzzle, string $solution) : bool {
        $timestamp = time();
        $tPuzzleHash = $this->hash($puzzle->getTimestamp() . $this->secret);
        $targetHash = $this->hash($tPuzzleHash);

        if($timestamp - $puzzle->getTimestamp() > $this->TTL) {
            throw new PuzzleTTLException();
        }

        if($targetHash !== $puzzle->getTargetHash()) {
            throw new InvalidPuzzleTargetHashException();
        }

        return $solution === $tPuzzleHash;
    }
}
