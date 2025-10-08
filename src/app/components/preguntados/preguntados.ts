import { Component, OnInit } from '@angular/core';
import { Question } from '../../interfaces_games/game.interface';
import { PreguntadosService } from '../../services/preguntados.service';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.css'
})

export class Preguntados implements OnInit{
  questions: Question[] = [];
  currentQuestionIndex: number = 0;
  score: number = 0;
  gameStarted: boolean = false;
  gameFinished: boolean = false;
  selectedAnswer: string = '';
  showResult: boolean = false;
  isCorrect: boolean = false;


  constructor(private preguntadosService: PreguntadosService, private gameService: GameService, private router: Router) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions() {
    this.preguntadosService
  }

  startGame(difficulty: string): void {
    this.preguntadosService.getQuestionsByDifficulty(difficulty).subscribe({
      next: (data) => {
        this.questions = data;
        this.gameStarted = true;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.gameFinished = false;
      },
      error: (err) => console.error('Error al cargar preguntas:', err)
    })
  }

  selectAnswer(answer: string): void {
    if (this.showResult) return; // para que no seleccione otra vez

    this.selectedAnswer = answer;
    this.isCorrect = answer === this.currentQuestion.correctAnswer;
    this.showResult = true;

    if (this.isCorrect) {
      this.score++;
    }

    setTimeout(() => {
      this.nextQuestion();
    }, 1500);
  }

  get currentQuestion(): Question {
    return this.questions[this.currentQuestionIndex]
  }

  nextQuestion(): void{
    this.showResult = false;
    this.selectedAnswer = '';

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    } else{
      this.finishGame();
    }
  }

  async finishGame(): Promise<void> {
    this.gameFinished = true;
    //----------GUARDAR SCORE
    await this.saveScorePreguntados();
  }

  async saveScorePreguntados(): Promise<void> {
    try {
      if (!this.questions[0]) return;
  
      await this.gameService.saveScoreWithDifficulty(
        'Preguntados',
        this.score,
        this.questions[0].difficulty
      );
      console.log('Score guardado correctamente');
    } catch (error) {
      console.error('Error al guardar score:', error);
    }
  }

  restartGame(): void {
    this.gameStarted = false;
    this.gameFinished = false;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = '';
    this.showResult = false;
  }

  get progress(): number{
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
