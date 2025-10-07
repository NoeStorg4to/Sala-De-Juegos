import { Injectable } from "@angular/core";
import { SupabaseService } from './supabase.service';
import { HangmanResult } from '../interfaces_games/game.interface';


@Injectable({
    providedIn: 'root'
})

export class AhorcadoService {
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

}
