import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Question, QuestionsResponse } from "../interfaces_games/game.interface";


@Injectable({
    providedIn: 'root'
})

export class PreguntadosService {
    private questionsUrl = 'data/questions.json';

    constructor(private http: HttpClient){}

    getQuestions(): Observable<Question[]> {
        return this.http.get<QuestionsResponse>(this.questionsUrl).pipe(
            map(response => response.questions)
        );
    }

    getQuestionsByDifficulty(difficulty: string): Observable<Question[]> {
        return this.getQuestions().pipe(
            map(questions => {
                const filtered = questions.filter(p => p.difficulty === difficulty);
                return this.shuffleArray(filtered).slice(0, 5); // 5 preguntas por dificultad
            })
        )
    }

    private shuffleArray (array: any[]): any[] {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
        }
        return newArray;
    }
}