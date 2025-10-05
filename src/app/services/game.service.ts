import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { HangmanResult, HigherLowerResult } from '../interfaces_games/game.interface';


@Injectable({
    providedIn: 'root'
})

export class GameService {
    constructor(private supabaseService: SupabaseService) { }

    private hangmanWords = [
    'ANGULAR', 'TYPESCRIPT', 'JAVASCRIPT', 'PROGRAMAR', 'SUPABASE',
    'COMPONENTE', 'SERVICIO', 'INTERFACE', 'VARIABLE', 'FUNCION',
    'CLASE', 'METODO', 'PROPIEDAD', 'ARRAY', 'OBJETO'
    ];

    // PALABRAS ALEATORIAS PARA EL AHORCADO
    getRandomWord(): string {
        return this.hangmanWords[Math.floor(Math.random() * this.hangmanWords.length)];
    }

    // GENERA LA BARAJA
    generateDeck(): any[] {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const deck: any[] = [];
        
        suits.forEach(suit => {
        for (let value = 1; value <= 13; value++) {
            let name: string;
            switch (value) {
                case 1: name = 'A'; break;
                case 11: name = 'J'; break;
                case 12: name = 'Q'; break;
                case 13: name = 'K'; break;
                default: name = value.toString();
            }
            
            deck.push({
            suit,
            value,
            name
            });
        }
        });
        
        return this.shuffleDeck(deck);
    }

    // MEZCLA CARTAS
    private shuffleDeck(deck: any[]): any[] {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    // GUARDA RESULTADOS DE AHORCADO
    async saveHangmanResult(result: HangmanResult): Promise<boolean> {
        try {
            const score = this.calcularHangmanScore(result);
            
            await this.supabaseService.saveGameScore('ahorcado', score, result.totalTime);
            
            console.log('Resultado del ahorcado guardado exitosamente');
            return true;
        } catch (error) {
            console.error('Error guardando resultado de ahorcado:', error);
            return false;
        }
    }

    private calcularHangmanScore(result: HangmanResult): number {
        if (!result.won) return 0;
        
        let baseScore = 100;
        const timeBonus = Math.max(0, 60 - result.totalTime); // Bonus por rapidez (menos tiempo = más puntos)
        const errorPenalty = result.wrongAttempts * 5;// Penalty por errores
        
        return Math.max(0, baseScore + timeBonus - errorPenalty);
    }

    // GUARDA EL DE MAYOR O MENOR
    async saveHigherLowerResult(result: HigherLowerResult): Promise<boolean> {
        try {
            await this.supabaseService.saveGameScore(
                'mayor_menor', 
                result.correctGuesses, 
                Math.round(result.accuracy)
            );
            
            console.log('Resultado del mayor/menor guardado exitosamente');
            return true;
        } catch (error) {
            console.error('Error guardando resultado de mayor/menor:', error);
            return false;
        }
    }

    async getBestScores(gameName: string, limit: number = 10) {
        try {
            const { data, error } = await this.supabaseService.client
                .from('game_scores')
                .select(`
                *,
                profiles (
                    username,
                    name,
                    lastname
                )
                `)
                .eq('game_name', gameName)
                .order('score', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo mejores puntajes:', error);
            return [];
        }
    }

    // DEL USUARIO ACTUAL
    async getUserGameScores(gameName: string, limit: number = 5) {
        try {
            const { data: { user } } = await this.supabaseService.user;
            if (!user) return [];

            const { data, error } = await this.supabaseService.client
                .from('game_scores')
                .select('*')
                .eq('user_id', user.id)
                .eq('game_name', gameName)
                .order('score', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo puntajes del usuario:', error);
            return [];
        }
    }


}