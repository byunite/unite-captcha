<?php

namespace Unite\Captcha\Generator;

use JsonSerializable;

class Puzzle implements JsonSerializable
{
    protected int $timestamp;
    protected string $puzzle;
    protected string $targetHash;

    public function __construct(int $timestamp, string $puzzle, string $targetHash)
    {
        $this->timestamp = $timestamp;
        $this->puzzle = $puzzle;
        $this->targetHash = $targetHash;
    }

    static function fromData(array $data) : Puzzle {
        return new Puzzle(
            $data['timestamp'],
            $data['puzzle'],
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
            'targetHash' => $this->getTargetHash(),
        ];
    }
}
