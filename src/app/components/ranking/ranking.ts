import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RankingData } from '../../interfaces_games/score.interface';
import { GameService } from '../../services/game.service';

type GameKey = keyof RankingData;

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.html',
  styleUrl: './ranking.css'
})
export class Ranking implements OnInit {
  constructor(private gameService: GameService) {}

  rankings: RankingData = {
    ahorcado: [],
    mayorMenor: [],
    preguntados: [],
    adivinaNumero: []
  };

  isLoading = true;
  selectedGame: GameKey = 'ahorcado';

  readonly games: GameKey[] = ['ahorcado', 'mayorMenor', 'preguntados', 'adivinaNumero'];

  readonly gameInfo: Record<GameKey, { title: string; icon: string }> = {
      ahorcado: { title: 'Ahorcado', icon: '🎯' },
      mayorMenor: { title: 'Mayor o Menor', icon: '🎲' },
      preguntados: { title: 'Preguntados', icon: '❓' },
      adivinaNumero: { title: 'Adivina el Número', icon: '🔢' }
  };

  async ngOnInit() {
    await this.loadRankings();
  }

  async loadRankings(){
    this.isLoading = true;
    try {
      this.rankings = await this.gameService.getAllRankings(10);
    } catch (error) {
      console.error('Error cargando rankings:', error);
    } finally {
      this.isLoading = false;
    }
  }

  selectGame(game: keyof RankingData) {
    this.selectedGame = game;
  }

  getMedalEmoji(position: number): string {
    switch (position){
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}°`;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
  }

}
