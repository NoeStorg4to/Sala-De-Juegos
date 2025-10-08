import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { AuthService } from '../../services/auth.service';
import { HangmanGame, HangmanResult } from '../../interfaces_games/game.interface';
import { AhorcadoService } from '../../services/ahorcado.service';


@Component({
  selector: 'app-ahorcado-game',
  standalone: true,
  imports: [],
  templateUrl: './ahorcado-game.html',
  styleUrl: './ahorcado-game.css'
})
export class AhorcadoGame implements OnInit {

  game: HangmanGame = {
    word: '',
    guessedLetters: [],
    wrongAttempts: 0,
    maxAttempts: 6,
    gameStatus: 'playing',
    startTime: new Date()
  };

  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  isLoading: boolean = false;
  showResult: boolean = false;
  isAuthenticated: boolean = false;

  constructor(
    private gameService: GameService,
    private ahorcadoService: AhorcadoService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.checkAuthentication();
    this.startNewGame();
  }

  private async checkAuthentication() {
    try {
      this.isAuthenticated = this.authService.isAuthenticated();
      
      if (!this.isAuthenticated) {
        console.warn('Usuario no autenticado, redirigiendo...');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      this.router.navigate(['/login']);
    }
  }

  getHangmanImage(): string {
    const attempt = Math.min(this.game.wrongAttempts, this.game.maxAttempts);
    return `imagenes/ahorcado-${attempt}.png`
  }

  startNewGame() {
    this.game = {
      word: this.ahorcadoService.getRandomWord(),
      guessedLetters: [],
      wrongAttempts: 0,
      maxAttempts: 6,
      gameStatus: 'playing',
      startTime: new Date()
    };
    this.showResult = false;
    console.log('Nueva palabra:', this.game.word); // Para debug 
  }

  guessLetter(letter: string) {
    if (this.game.gameStatus !== 'playing' || this.game.guessedLetters.includes(letter)) {
      return;
    }

    this.game.guessedLetters.push(letter);

    if (!this.game.word.includes(letter)) {
      this.game.wrongAttempts++;
    }

    this.checkGameStatus();
  }

  private checkGameStatus() {
    const hasWon = this.game.word.split('').every(letter => 
      this.game.guessedLetters.includes(letter)
    );

    if (hasWon) {
      this.game.gameStatus = 'won';
      this.game.endTime = new Date();
      this.endGame();
    } else if (this.game.wrongAttempts >= this.game.maxAttempts) {
      this.game.gameStatus = 'lost';
      this.game.endTime = new Date();
      this.endGame();
    }
  }

  private async endGame() {
    if (!this.isAuthenticated) {
      this.showResult = true;
      return;
    }

    this.isLoading = true;
    
    try {
      const result: HangmanResult = {
        won: this.game.gameStatus === 'won',
        totalTime: this.calcularTotalTime(),
        lettersUsed: this.game.guessedLetters.length,
        wrongAttempts: this.game.wrongAttempts,
        word: this.game.word
      };

      const saved = await this.gameService.saveHangmanResult(result);
      
      if (saved) {
        console.log('Resultado guardado exitosamente');
      } else {
        console.warn('No se pudo guardar el resultado');
      }
    } catch (error) {
      console.error('Error al finalizar el juego:', error);
    } finally {
      this.isLoading = false;
      this.showResult = true;
    }
  }

  calcularTotalTime(): number {
    if (!this.game.endTime) return 0;
    return Math.round((this.game.endTime.getTime() - this.game.startTime.getTime()) / 1000);
  }

  // PARA LA PLANTILLA
  getDisplayWord(): string {
    return this.game.word
      .split('')
      .map(letter => this.game.guessedLetters.includes(letter) ? letter : '_')
      .join(' ');
  }

  isLetterGuessed(letter: string): boolean {
    return this.game.guessedLetters.includes(letter);
  }

  isLetterWrong(letter: string): boolean {
    return this.game.guessedLetters.includes(letter) && !this.game.word.includes(letter);
  }

  // getHangmanImage(): string {
  //   return `assets/hangman/hangman-${this.game.wrongAttempts}.svg`; // Retorna la imagen del ahorcado basada en los intentos fallidos
  // }

  goHome() {
    this.router.navigate(['/home']);
  }

  // GETTERS PARA PLANTILLA
  get remainingAttempts(): number {
    return this.game.maxAttempts - this.game.wrongAttempts;
  }

  get gameWon(): boolean {
    return this.game.gameStatus === 'won';
  }

  get gameLost(): boolean {
    return this.game.gameStatus === 'lost';
  }

  get gameEnded(): boolean {
    return this.game.gameStatus !== 'playing';
  }
}
