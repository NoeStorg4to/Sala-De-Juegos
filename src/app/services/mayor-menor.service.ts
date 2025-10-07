import { Injectable } from "@angular/core";


@Injectable({
    providedIn: 'root'
})

export class MayorMenorService {
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

    private shuffleDeck(deck: any[]): any[] {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }
}