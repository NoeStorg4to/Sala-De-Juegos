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

    

}
