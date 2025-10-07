import { Injectable } from "@angular/core";
import { GuessNumberGame } from "../interfaces_games/game.interface";

@Injectable({
    providedIn: 'root'
})

export class GuessNumberService {

    constructor() {}

    startnewGame(difficulty: string): GuessNumberGame {
        const config = {
            easy: { range: 50, maxAttempts: 10, baseScore: 100},
            medium: { range: 100, maxAttempts: 8, baseScore: 200},
            hard: { range: 200, maxAttempts: 6, baseScore: 300},
        };
        const { range, maxAttempts, baseScore } = config[difficulty as keyof typeof config];

        return {
            difficulty: difficulty,
            numberToGuess: Math.floor(Math.random() * range) + 1,
            maxAttempts: maxAttempts,
            currentAttempt: 0,
            score: baseScore,
            gameOver: false,
            gameWon: false
        };
    }

    makeGuess(game: GuessNumberGame, userGuess: number): { updatedGame: GuessNumberGame, result: string } {
        if(game.gameOver ) {
            return { updatedGame: game, result: 'game_over' };
        }

        const updatedGame = { ...game };
        updatedGame.currentAttempt++;

        if(userGuess === updatedGame.numberToGuess) {
            updatedGame.gameWon = true;
            updatedGame.gameOver = true;
            return { result: 'win', updatedGame };
        }

        if (updatedGame.currentAttempt >= updatedGame.maxAttempts) {
            updatedGame.gameOver = true;
            updatedGame.score = 0;
            return { result: 'lose',  updatedGame };
        }

        updatedGame.score = Math.max(0, updatedGame.score - 10);

        const hint = userGuess < updatedGame.numberToGuess ? 'mayor' : 'menor';
        return { result: hint, updatedGame }
    }

    getRemainingAttempts(game: GuessNumberGame): number {
        return game.maxAttempts - game.currentAttempt;
    }

    getMaxRange(difficulty: string): number {
        const ranges = { easy: 50, medium: 100, hard: 200};
        return ranges[difficulty as keyof typeof ranges] || 100;
    }

}