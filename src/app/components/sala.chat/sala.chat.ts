import { Component, OnInit, OnDestroy, ViewChild, ElementRef,  AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ChatMessage } from '../../interfaces_games/chat.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sala-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sala.chat.html',
  styleUrl: './sala.chat.css'
})
export class SalaChat implements OnInit, OnDestroy, AfterViewChecked{
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  messages$: Observable<ChatMessage[]>;
  newMessage: string = '';
  isLoading: boolean = false;
  error: string = '';

  constructor(private chatService: ChatService, private authService: AuthService) {
    this.messages$ = this.chatService.messages$;
  }

  async ngOnInit() {
    // this.chatService.testRealtime();
    try {
      this.isLoading = true;
      await this.chatService.initializeChat();
    } catch (error) {
      console.error('Error inicializando chat:', error);
      this.error = 'Error al cargar el chat. Por favor, intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  ngAfterViewChecked() { // Se ejecuta despues de que angular actualiza la vista
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.chatService.cleanup();
  }

  async sendMessage() {
    if (!this.newMessage.trim() || this.isLoading) {
      return;
    }

    const messageToSend = this.newMessage.trim();
    this.newMessage = '';
    this.error = '';

    try {
      await this.chatService.sendMessage(messageToSend);
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      this.error = error.message || 'Error al enviar mensaje';
      this.newMessage = messageToSend;
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isOwnMessage(message: ChatMessage): boolean {
    return this.chatService.isOwnMessage(message);
  }

  formatTime(timestamp: string): string {
    return this.chatService.formatMessageTime(timestamp);
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  getCurrentUsername(): string {
    return this.authService.getCurrentProfile()?.username || 'Usuario';
  }

}
