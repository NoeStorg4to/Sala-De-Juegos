
export interface GameScoreWithProfile {
    id: string;
    user_id: string;
    game_name: string;
    score: number;
    level: number;
    play_date: string;
    profiles: {
        username: string;
        name: string;
        lastname: string;
    };
}

export interface RankingData {
    ahorcado: GameScoreWithProfile[];
    mayorMenor: GameScoreWithProfile[];
    preguntados: GameScoreWithProfile[];
    adivinaNumero: GameScoreWithProfile[];
}