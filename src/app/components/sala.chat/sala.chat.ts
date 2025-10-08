import { Component, OnInit, OnDestroy, ViewChild, ElementRef,  AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ChatMessage } from '../../interfaces_games/chat.interface';
import { Observable, Subscription } from 'rxjs';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-sala-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sala.chat.html',
  styleUrl: './sala.chat.css'
})
export class SalaChat implements OnInit, OnDestroy{
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
    isChatOpen = false;
    messages: ChatMessage[] = [];
    newMessage = '';
    isAuthenticated = false;

    private messagesSubscription?: Subscription;
    private authSubscription?: Subscription;

    constructor(private chatService: ChatService, private authService: AuthService, private supabase: SupabaseService) {}

    async ngOnInit() {
      console.log('🔵 ChatComponent ngOnInit - Componente inicializado');

      this.authSubscription = this.authService.authState$.subscribe(state => {
          console.log('🔐 Estado de auth cambió:', state.isAuthenticated);

          this.isAuthenticated = state.isAuthenticated;
          
          if (this.isAuthenticated) {
              this.initializeChat();
          }
      });
    }

    private async initializeChat(): Promise<void> {
        await this.chatService.initializeChat();

        this.messagesSubscription = this.chatService.messages$.subscribe(messages => {
            this.messages = messages;
            setTimeout(() => this.scrollToBottom(), 100);
        });
    }

    toggleChat(): void {
        if (!this.isAuthenticated) {
            alert('Debes iniciar sesión para usar el chat'); //CAMBIAR POR MODAL
            return;
        }
        this.isChatOpen = !this.isChatOpen;
        
        if (this.isChatOpen) {
            setTimeout(() => this.scrollToBottom(), 100);
        }
    }

    closeChat(): void {
        this.isChatOpen = false;
    }

    async sendMessage(): Promise<void> {
        if (!this.newMessage.trim()) return;

        const result = await this.chatService.sendMessage(this.newMessage);
        
        if (result.error) {
            console.error('Error enviando mensaje:', result.error);
            alert('Error al enviar el mensaje');
        } else {
            this.newMessage = '';
        }
    }

    onKeyPress(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    isOwnMessage(message: ChatMessage): boolean {
        return this.chatService.isOwnMessage(message);
    }

    formatTime(dateString: string): string {
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    private scrollToBottom(): void {
        try {
            if (this.messagesContainer) {
                this.messagesContainer.nativeElement.scrollTop = 
                    this.messagesContainer.nativeElement.scrollHeight;
            }
        } catch (err) {
            console.error('Error al hacer scroll:', err);
        }
    }

    ngOnDestroy(): void {
      console.log('🔴 ChatComponent ngOnDestroy - Componente destruido');
        this.messagesSubscription?.unsubscribe();
        this.authSubscription?.unsubscribe();
        this.chatService.unsubscribeFromChat();
    }

    
}
