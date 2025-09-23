import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage } from '../interfaces_games/chat.interface';


@Injectable({
    providedIn: 'root'
})

export class ChatService {
    private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
    public messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();
    private subscription: any;

    constructor(private supabase: SupabaseService,private auth: AuthService) {}

    async initializeChat(): Promise<void> {
        try {
            await this.waitForAuth();
            await this.loadMessages();
            this.setupRealtimeSubscription();
        } catch (error) {
            console.error('Error inicializando chat:', error);
        }
    }

    private async waitForAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
        const subscription = this.auth.authState$.subscribe(authState => {
        console.log('Estado de auth en chat:', authState);
        
        if (authState.isAuthenticated && authState.user && authState.profile) {
            subscription.unsubscribe();
            resolve();
        } else if (authState.user === null && authState.profile === null) {
            subscription.unsubscribe();
            reject(new Error('Usuario no autenticado'));
        }
        // Si está undefined, seguimos esperando
        });
        
        setTimeout(() => {
        subscription.unsubscribe();
        reject(new Error('Timeout esperando autenticación'));
        }, 10000);
    });
}

    private async loadMessages(): Promise<void> {
        try {
            const { data, error } = await this.supabase.client
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(50); // tope de 50 para no traer tantos mensajes innecesarios y viejos

            if (error) throw error;
            this.messagesSubject.next(data || []);
        } catch (error) {
            console.error('Error cargando mensajes:', error);
            throw error;
        }
    }

    private setupRealtimeSubscription(): void {
        this.subscription = this.supabase.client
            .channel('messages')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    // ACA TODOS RECIBEN EL MENSAJE QUE SE INSERTA
                    const newMessage = payload.new as ChatMessage;
                    const currentMessages = this.messagesSubject.value;
                    this.messagesSubject.next([...currentMessages, newMessage]);
                }
            )
            .subscribe();
    }

    async sendMessage(message: string): Promise<void> {
        try {
            const currentUser = this.auth.getCurrentUser();
            const currentProfile = this.auth.getCurrentProfile();

            if (!currentUser || !currentProfile) {
                throw new Error('Usuario no autenticado');
            }

            if (!message.trim()) {
                throw new Error('El mensaje no puede estar vacío');
            }

            const messageData = {
                user_id: currentUser.id,
                username: currentProfile.username,
                message: message.trim()
            };

            const { error } = await this.supabase.client
                .from('messages')
                .insert(messageData);

            if (error) throw error;

        } catch (error) {
            console.error('Error enviando mensaje:', error);
            throw error;
        }
    }

    cleanup(): void {
        if (this.subscription) {
            this.supabase.client.removeChannel(this.subscription);
        }
    }

    isOwnMessage(message: ChatMessage): boolean {
        const currentUser = this.auth.getCurrentUser();
        return currentUser?.id === message.user_id;
    }

    formatMessageTime(timestamp: string): string {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-AR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

}