<?php

namespace Unite\Tests\Captcha\Generator;

use PHPUnit\Framework\TestCase;
use Unite\Captcha\Exception\InvalidPuzzleTargetHashException;
use Unite\Captcha\Exception\PuzzleTTLException;
use Unite\Captcha\Generator\Captcha;
use Unite\Captcha\Generator\Puzzle;

class CaptchaTest extends TestCase
{
    public function testPuzzleGeneration() : void {
        $captcha = new Captcha('SECRET');
        $puzzle = $captcha->createPuzzle();

        $this->assertGreaterThanOrEqual(time(), $puzzle->getTimestamp());
        $this->assertNotEmpty($puzzle->getPuzzle());
        $this->assertNotEmpty($puzzle->getTargetHash());
        $this->assertMatchesRegularExpression("/^([a-f0-9]{64})$/", $puzzle->getTargetHash());
    }

    /**
     * @throws InvalidPuzzleTargetHashException
     * @throws PuzzleTTLException
     */
    public function testInvalidPuzzleSolution() : void {
        $captcha = new Captcha('SECRET');
        $puzzle = $captcha->createPuzzle();
        $this->assertFalse($captcha->checkPuzzle($puzzle, ''));
        $this->assertFalse($captcha->checkPuzzle($puzzle, 'FOO'));
        $this->assertFalse($captcha->checkPuzzle($puzzle, $puzzle->getTargetHash()));
        $this->assertFalse($captcha->checkPuzzle($puzzle, $puzzle->getPuzzle()));
        $this->assertFalse($captcha->checkPuzzle($puzzle, $puzzle->getTimestamp()));
    }

    /**
     * @throws InvalidPuzzleTargetHashException
     * @throws PuzzleTTLException
     */
    public function testPuzzleTTLException() : void {
        $captcha = new Captcha('SECRET', 17,20);
        $puzzle = $captcha->createPuzzle();
        $this->expectException(PuzzleTTLException::class);
        $captcha->checkPuzzle(new Puzzle(time() - 21, $puzzle->getPuzzle(), $puzzle->getPuzzleStrength(), $puzzle->getTargetHash(), 20), 'XXX');
    }

    /**
     * @throws InvalidPuzzleTargetHashException
     * @throws PuzzleTTLException
     */
    public function testInvalidPuzzleTargetPathException() : void {
        $captcha = new Captcha('SECRET');
        $puzzle = $captcha->createPuzzle();
        $this->expectException(InvalidPuzzleTargetHashException::class);
        $captcha->checkPuzzle(new Puzzle(time(), $puzzle->getPuzzle(), 17, 'BAA', 60), 'XXX');
    }

    /**
     * @throws PuzzleTTLException
     * @throws InvalidPuzzleTargetHashException
     */
    public function testValidSolution() : void {
        $captcha = new Captcha('SECRET');
        $puzzle = $captcha->createPuzzle();
        $solution = hash('sha256', $puzzle->getTimestamp() . 'SECRET');
        $this->assertTrue($captcha->checkPuzzle($puzzle, $solution));
    }

    public function testJsonSerialization() {
        $data = [
            'timestamp' => 12345,
            'puzzle' => 'PUZZLE',
            'puzzleStrength' => 1234,
            'targetHash' => 'HASH',
            'TTL' => 123,
        ];
        $puzzle = Puzzle::fromData($data);
        $this->assertEquals($data, $puzzle->jsonSerialize());
    }
}
