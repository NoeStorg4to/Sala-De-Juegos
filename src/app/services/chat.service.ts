import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage } from '../interfaces_games/chat.interface';
import { RealtimeChannel } from '@supabase/supabase-js';



@Injectable({
    providedIn: 'root'
})

export class ChatService {
    private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
    public messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();

    private channel: RealtimeChannel | null = null;
    private isSubscribed = false;

    constructor(private supabaseService: SupabaseService, private auth: AuthService){}

    async initializeChat(): Promise<void> {
        if (this.isSubscribed) {
            console.log('⚠️ Chat ya inicializado');
            return
        };

        try {
            await this.loadMessages();
            console.log('📥 Mensajes cargados:', this.messagesSubject.value.length);

            this.channel = this.supabaseService.client
                .channel('public:messages')
                .on(
                    'postgres_changes',
                    {event: 'INSERT', schema: 'public', table: 'messages'}, (payload) => {
                        console.log('Nuevo mensaje recibido:', payload);
                        this.handleNewMessage(payload.new as ChatMessage);
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('Suscrito al chat en tiempo real');
                        this.isSubscribed = true;
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error('❌ Error en el canal de Realtime');
                    } else if (status === 'TIMED_OUT') {
                        console.error('⏱️ Timeout en la suscripción');
                    }
                })
        }catch (error) {
            console.error('Error inicializando chat:', error);
        }
    }

    private async loadMessages(): Promise<void> {
        try {
            const { data, error } = await this.supabaseService.client
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true})
                .limit(50);
            
            if (error) throw error;

            this.messagesSubject.next(data || [])
        }catch (error){
            console.error('Error cargando mensajes:', error);
        }
    }

    private handleNewMessage(newMessage: ChatMessage): void {
        const currentMessages = this.messagesSubject.value;

        const messageExists = currentMessages.some(msg => msg.id === newMessage.id);

        if (!messageExists) {
            this.messagesSubject.next([...currentMessages, newMessage]);
        }
    }

    async sendMessage(messageText: string): Promise<{ error: any }> {
        try {
            const currentUser = this.auth.getCurrentUser();
            const currentProfile = this.auth.getCurrentProfile();

            if(!currentUser || !currentProfile) {
                return { error: new Error('Usuario no autenticado') };
            }

            const messageData: Omit<ChatMessage, 'id'> = {
                user_id: currentUser.id,
                username: currentProfile.username,
                message: messageText.trim(),
                created_at: new Date().toISOString()
            };

            const { error } = await this.supabaseService.client
                .from('messages').insert(messageData);

                if (error) throw error;

                return { error: null };
        }catch (error) {
            console.error('Error enviando mensaje:', error);
            return { error };
        }
    }

    // LIMPIAR SUSCRIPCION DEL CHAT
    unsubscribeFromChat(): void {
        if (this.channel) {
            this.supabaseService.client.removeChannel(this.channel);
            this.channel = null;
            this.isSubscribed = false;
            console.log(' Desuscrito del chat');
        }
    }

    //MENSAJE ES DE USUARIO?
    isOwnMessage(message: ChatMessage): boolean {
        const currentUser = this.auth.getCurrentUser();
        return currentUser?.id === message.user_id;
    }

    // OBTENER MENSAJES ACTUALES
    getCurrentMessages(): ChatMessage[] {
        return this.messagesSubject.value;
    }
}