import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';
import { AuthService } from '../../services/auth.service';
import { HigherLowerGame, HigherLowerResult, Card } from '../../interfaces_games/game.interface';
import { MayorMenorService } from '../../services/mayor-menor.service';


@Component({
  selector: 'app-mayor-menor.game',
  standalone: true,
  imports: [],
  templateUrl: './mayor-menor.game.html',
  styleUrl: './mayor-menor.game.css'
})
export class MayorMenorGame implements OnInit, OnDestroy{
  game: HigherLowerGame = {
    currentCard: { suit: 'hearts', value: 0, name: '' },
    deck: [],
    correctGuesses: 0,
    gameStatus: 'playing',
    startTime: new Date()
  };

  isLoading: boolean = false;
  showResult: boolean = false;
  isAuthenticated: boolean = false;
  showFeedback: boolean = false;
  lastGuessCorrect: boolean = false;
  private authSubscription!: Subscription;

  // CONTADORESS
  totalCards: number = 0;
  maxScore: number = 0;

  constructor(private mayorMenorService: MayorMenorService, 
    private gameService: GameService,
    private authService: AuthService, 
    private router: Router) {}

  ngOnInit() {
    this.checkAuthentication();
    this.startNewGame();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private checkAuthentication() {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    if (!this.isAuthenticated) {
      console.warn('Usuario no autenticado, redirigiendo...');
      this.router.navigate(['/login']);
      return;
    }

    this.authSubscription = this.authService.authState$.subscribe(authState => {
      this.isAuthenticated = authState.isAuthenticated;
      
      if (!this.isAuthenticated) {
        console.warn('Usuario deslogueado, redirigiendo...');
        this.router.navigate(['/login']);
      }
    });
  }

  startNewGame() {
    const deck = this.mayorMenorService.generateDeck();
    this.game = {
      currentCard: deck[0],
      nextCard: deck[1],
      deck: deck,
      correctGuesses: 0,
      gameStatus: 'playing',
      startTime: new Date()
    };
    
    this.totalCards = 1;
    this.showResult = false;
    this.showFeedback = false;
    
    console.log('Nueva partida iniciada');
    console.log('Primera carta:', this.game.currentCard); // Para debug
  }

  makeGuess(guessHigher: boolean) {
    if (this.game.gameStatus !== 'playing' || !this.game.nextCard) {
      return;
    }

    const currentValue = this.game.currentCard.value;
    const nextValue = this.game.nextCard.value;
    
    const isHigher = nextValue > currentValue; // La adivinanza fue correcta?
    const isCorrect = (guessHigher && isHigher) || (!guessHigher && !isHigher);
    
    const isTie = nextValue === currentValue; // En caso de empate, siempre es incorrecto
    const finalCorrect = isCorrect && !isTie;

    this.lastGuessCorrect = finalCorrect;
    this.showFeedback = true;

    if (finalCorrect) { // Actualizar puntaje
      this.game.correctGuesses++;
      this.maxScore = Math.max(this.maxScore, this.game.correctGuesses);
    }

    this.totalCards++;

    setTimeout(() => { // Espero un momento para mostrar el feedback y luego continuar
      this.showFeedback = false;
      
      if (!finalCorrect) {
        this.endGame();// Fin del juego por error
      } else {
        this.nextRound(); // ContinuO con la siguiente carta
      }
    }, 1000);
  }

  private nextRound() {
    if (this.game.deck.length <= this.totalCards + 1) {
      this.endGame(); // Se acabo el mazo
      return;
    }

    this.game.currentCard = this.game.nextCard!;     // Next carta
    this.game.nextCard = this.game.deck[this.totalCards + 1];
  }

  private async endGame() {
    this.game.gameStatus = 'finished';
    this.game.endTime = new Date();

    if (!this.isAuthenticated) {
      this.showResult = true;
      return;
    }

    this.isLoading = true;
    
    try {
      const result: HigherLowerResult = {
        correctGuesses: this.game.correctGuesses,
        totalCards: this.totalCards,
        accuracy: this.totalCards > 1 ? (this.game.correctGuesses / (this.totalCards - 1)) * 100 : 0,
        totalTime: this.calcularTotalTime()
      };

      const saved = await this.gameService.saveHigherLowerResult(result);
      
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

  // METODOS PARA PLANTILLA
  getCardSymbol(suit: string): string {
    switch (suit) {
      case 'hearts': return '♥️';
      case 'diamonds': return '♦️';
      case 'clubs': return '♣️';
      case 'spades': return '♠️';
      default: return '?';
    }
  }

  getCardColor(suit: string): string {
    return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  // GETTERS PARA PLANTILLA
  get gameEnded(): boolean {
    return this.game.gameStatus === 'finished';
  }

  get currentStreak(): number {
    return this.game.correctGuesses;
  }

  get hasNextCard(): boolean {
    return !!this.game.nextCard;
  }

}
