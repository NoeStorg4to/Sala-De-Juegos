// ------------------ PARA AHORCADO
export interface HangmanGame {
    word: string;
    guessedLetters: string[];
    wrongAttempts: number;
    maxAttempts: number;
    gameStatus: 'playing' | 'won' | 'lost';
    startTime: Date;
    endTime?: Date;
}

export interface HangmanResult {
    won: boolean;
    totalTime: number; // en segundos
    lettersUsed: number;
    wrongAttempts: number;
    word: string;
}

// ------------------ PARA MAYOR O MENOR
export interface Card {
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    value: number; // 1-13 (As=1, J=11, Q=12, K=13)
    name: string; // 'A', '2', '3'... 'J', 'Q', 'K'
}

export interface HigherLowerGame {
    currentCard: Card;
    nextCard?: Card;
    deck: Card[];
    correctGuesses: number;
    gameStatus: 'playing' | 'finished';
    startTime: Date;
    endTime?: Date;
}

export interface HigherLowerResult {
    correctGuesses: number;
    totalCards: number;
    accuracy: number; // porcentaje
    totalTime: number; // en segundos
}

// ------------------  PARA PREGUNTADOS
export interface Quiestion {
    question: string;
    correct_answer: string;
    incorrect_answwers: string[];
    category: string;
    difficulty: string;
}