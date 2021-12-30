<?php

namespace Unite\Captcha\Generator;

use JsonSerializable;

class Puzzle implements JsonSerializable
{
    protected int $timestamp;
    protected string $puzzle;
    protected int $puzzleStrength;
    protected string $targetHash;

    public function __construct(int $timestamp, string $puzzle, int $puzzleStrength, string $targetHash)
    {
        $this->timestamp = $timestamp;
        $this->puzzle = $puzzle;
        $this->puzzleStrength = $puzzleStrength;
        $this->targetHash = $targetHash;
    }

    static function fromData(array $data) : Puzzle {
        return new Puzzle(
            $data['timestamp'],
            $data['puzzle'],
            $data['puzzleStrength'],
            $data['targetHash'],
        );
    }

    /**
     * @return int
     */
    public function getTimestamp(): int
    {
        return $this->timestamp;
    }

    /**
     * @return string
     */
    public function getPuzzle(): string
    {
        return $this->puzzle;
    }

    /**
     * @return int
     */
    public function getPuzzleStrength(): int
    {
        return $this->puzzleStrength;
    }

    /**
     * @return string
     */
    public function getTargetHash(): string
    {
        return $this->targetHash;
    }

    public function jsonSerialize(): array
    {
        return [
            'timestamp' => $this->getTimestamp(),
            'puzzle' => $this->getPuzzle(),
            'puzzleStrength' => $this->getPuzzleStrength(),
            'targetHash' => $this->getTargetHash(),
        ];
    }
}
