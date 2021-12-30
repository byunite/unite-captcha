<?php

namespace Unite\Captcha\Generator;

use JsonSerializable;

class Puzzle implements JsonSerializable
{
    protected int $timestamp;
    protected string $puzzle;
    protected int $puzzleStrength;
    protected string $targetHash;
    protected int $TTL;

    public function __construct(int $timestamp, string $puzzle, int $puzzleStrength, string $targetHash, int $TTL)
    {
        $this->timestamp = $timestamp;
        $this->puzzle = $puzzle;
        $this->puzzleStrength = $puzzleStrength;
        $this->targetHash = $targetHash;
        $this->TTL = $TTL;
    }

    static function fromData(array|object $data) : Puzzle {
        $data = (array)$data;
        return new Puzzle(
            $data['timestamp'],
            $data['puzzle'],
            $data['puzzleStrength'],
            $data['targetHash'],
            $data['TTL'],
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

    /**
     * @return int
     */
    public function getTTL(): int
    {
        return $this->TTL;
    }

    public function jsonSerialize(): array
    {
        return [
            'timestamp' => $this->getTimestamp(),
            'puzzle' => $this->getPuzzle(),
            'puzzleStrength' => $this->getPuzzleStrength(),
            'targetHash' => $this->getTargetHash(),
            'TTL' => $this->getTTL(),
        ];
    }
}
