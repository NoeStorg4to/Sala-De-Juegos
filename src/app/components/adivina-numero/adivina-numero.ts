import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GuessNumberGame } from '../../interfaces_games/game.interface';
import { GuessNumberService } from '../../services/adivina-numero.service';
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-adivina-numero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adivina-numero.html',
  styleUrl: './adivina-numero.css'
})
export class AdivinaNumero implements OnInit{
  currentGame: GuessNumberGame | null = null;
  userGuess: number | null = null;
  gameStarted: boolean = false;
  gameFinished: boolean = false;
  showResult: boolean = false;
  resultMessage: string = '';
  lastHint: string = '';

  constructor(
    private guessNumberService: GuessNumberService, 
    private supabaseService: SupabaseService,
    private gameService: GameService) {}

    topScore: number = 0;
    
    async ngOnInit() {
        await this.loadTopScore();
    }

    async loadTopScore() {
        this.topScore = await this.gameService.getTopScore('AdivinaNumero');
    }

  startGame(difficulty: string): void {
    this.currentGame = this.guessNumberService.startnewGame(difficulty);
    this.gameStarted = true;
    this.gameFinished = false;
    this.showResult = false;
    this.userGuess = null;
    this.lastHint = '';
  }

  makeGuess(): void {
    if(!this.currentGame || this.userGuess === null) return;

    const { updatedGame, result } = this.guessNumberService.makeGuess(this.currentGame, this.userGuess);
    this.currentGame = updatedGame;
    this.showResult = true;
    this.lastHint = result;

    switch (result) {
      case 'win':
        this.resultMessage = 'Correcto!';
        setTimeout(() => this.finishGame(), 1500);
        break;
      case 'lose':
        this.resultMessage = `Game Over!! El numero era ${this.currentGame.numberToGuess}`;
        setTimeout(() => this.finishGame(), 2000);
        break;
      case 'mayor':
        this.resultMessage = 'El numero es MAYOR';
        setTimeout(() => this.hideResult(), 1500);
        break;
      case 'menor':
        this.resultMessage = 'El numero es MENOR';
        setTimeout(() => this.hideResult(), 1500);
        break;
    }
    this.userGuess = null;
  }

  hideResult(): void {
    this.showResult = false;
    this.resultMessage = '';
  }

  async finishGame(): Promise<void> {
    this.gameFinished = true;
    if(this.currentGame?.gameWon) {
      await this.saveScore();
    }
  }

  async saveScore(): Promise<void> {
    try {
      if (!this.currentGame) return;

      const difficultyLevel = this.getDifficultyLevel(this.currentGame.difficulty);

      await this.supabaseService.saveGameScore(
        'AdivinaNumero',
        this.currentGame.score,
        difficultyLevel
      );
      console.log('Score guardado correctamente');
    }catch (error) {
      console.error('Error al guardar score:', error);
    }
  }

  private getDifficultyLevel(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      default: return 1;
    }
  }

  restartGame(): void {
    this.gameStarted = false;
    this.gameFinished = false;
    this.currentGame = null;
    this.userGuess = null;
    this.showResult = false;
    this.resultMessage = '';
    this.lastHint = '';
  }

  get progress(): number {
    if(!this.currentGame) return 0;
    return (this.currentGame.currentAttempt / this.currentGame.maxAttempts) * 100;
  }

  get remainingAttemps(): number {
    if(!this.currentGame) return 0;
    return this.currentGame.maxAttempts - this.currentGame.currentAttempt;
  }

  get maxRange(): number {
    if(!this.currentGame) return 100;
    return this.guessNumberService.getMaxRange(this.currentGame.difficulty);
  }

  getDifficultyName(difficulty: string): string {
    const names: { [key: string]: string} = {
      easy: 'Facil',
      medium: 'Medio',
      hard: 'Dificil'
    };
    return names[difficulty] || difficulty;
  }
}
