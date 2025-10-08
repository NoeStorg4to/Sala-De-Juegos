import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { HangmanResult, HigherLowerResult } from '../interfaces_games/game.interface';
import { GameScoreWithProfile } from '../interfaces_games/score.interface';


@Injectable({
    providedIn: 'root'
})

export class GameService {
    constructor(private supabaseService: SupabaseService) { }

    private readonly GAME_NAMES = {
        AHORCADO: 'ahorcado',
        MAYOR_MENOR: 'mayor_menor',
        PREGUNTADOS: 'Preguntados',
        ADIVINA_NUMERO: 'AdivinaNumero'
    } as const;

    // SCORE PARA JUEGOS CON DIFICULTAD
    async saveScoreWithDifficulty(gameName: string, score: number, difficulty: string): Promise<boolean> {
        try {
            const level = this.mapDifficultyToLevel(difficulty);
            await this.supabaseService.saveGameScore(gameName, score, level);
            console.log(`Score guardado en ${gameName}: ${score} pts (nivel ${level})`);
            return true;
        }catch (error) {
            console.error(` Error guardando score en ${gameName}:`, error);
            return false;
        }
    }

    // CALCULOS DE SCORE
    private mapDifficultyToLevel(difficulty: string): number {
        const levels: Record<string, number> = {
            easy: 1,
            medium: 2,
            hard: 3
        }
        return levels[difficulty.toLocaleLowerCase()] ?? 1;
    }

    private calcularHangmanScore(result: HangmanResult): number {
        let score = 1000; // Base
        
        if (result.totalTime > 30) {  // Penalizar por tiempo
            score -= (result.totalTime - 30);
        }
        score -= result.wrongAttempts * 50;  // Penalizar por intentos fallidos
        
        if (result.lettersUsed < result.word.length + 3) { // Bonus por usar pocas letras
            score += 100;
        }
        return Math.max(0, score);
    }

    // GUARDA EL DE MAYOR O MENOR
    async saveHigherLowerResult(result: HigherLowerResult): Promise<boolean> {
        try {
            await this.supabaseService.saveGameScore(
                this.GAME_NAMES.MAYOR_MENOR, 
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

    // GUARDA EL AHORCADO
    async saveHangmanResult(result: HangmanResult): Promise<boolean> {
        try {
            if (!result.won) {
                console.log('Juego perdido, no se guarda score');
                return false;
            }

            const score = this.calcularHangmanScore(result);
            await this.supabaseService.saveGameScore(
                this.GAME_NAMES.AHORCADO, 
                score, 
                result.totalTime
            );
            
            console.log(`Score de Ahorcado guardado: ${score} pts`);
            return true;
        } catch (error) {
            console.error('Error guardando resultado de ahorcado:', error);
            return false;
        }
    }

    // METODOS PARA OBTENER SCORES
    async getBestScores(gameName: string, limit: number = 10){
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

    async getTopScore(gameName: string): Promise<number> {
        try {
            const { data, error } = await this.supabaseService.client
                .from('game_scores')
                .select('score')
                .eq('game_name', gameName)
                .order('score', { ascending: false })
                .limit(1)
                .single();

            if (error) throw error;
            return data?.score || 0;
        } catch (error) {
            console.error(`Error obteniendo top score de ${gameName}:`, error);
            return 0;
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

    async getAllRankings(limit: number = 10) {
        try {
            const [ahorcado, mayorMenor, preguntados, adivinaNumero] = await Promise.all([
                this.getBestScores(this.GAME_NAMES.AHORCADO, limit),
                this.getBestScores(this.GAME_NAMES.MAYOR_MENOR, limit),
                this.getBestScores(this.GAME_NAMES.PREGUNTADOS, limit),
                this.getBestScores(this.GAME_NAMES.ADIVINA_NUMERO, limit)
            ]);

            return {
                ahorcado,
                mayorMenor,
                preguntados,
                adivinaNumero
            };
        } catch (error) {
            console.error('Error obteniendo todos los rankings:', error);
            return {
                ahorcado: [],
                mayorMenor: [],
                preguntados: [],
                adivinaNumero: []
            };
        }
    }

    getGameNames() {
        return this.GAME_NAMES;
    }
}