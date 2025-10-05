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

    // CAMBIAMOS EL WAIT - AHORA VERIFICA EL USUARIO ACTUAL PARA AUTENTICAR A TIEMPO
    private async waitForAuth(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Primero verificar si ya está autenticado
            const currentState = this.auth.getCurrentAuthState();
            
            if (currentState.isAuthenticated && currentState.user && currentState.profile) {
                console.log('Ya autenticado:', currentState.profile.username); //#########
                resolve();
                return;
            }

            // Si no, esperar a que se autentique
            const authSubscription = this.auth.authState$.subscribe(authState => {
                console.log('Estado de auth en chat:', authState); //##############
                
                if (authState.isAuthenticated && authState.user && authState.profile) {
                    console.log('Autenticado:', authState.profile.username);//##########
                    authSubscription.unsubscribe();
                    resolve();
                } else if (authState.user === null && authState.profile === null) {
                    authSubscription.unsubscribe();
                    reject(new Error('Usuario no autenticado'));
                }
            });
            
            setTimeout(() => {
                authSubscription.unsubscribe();
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
        const channelName = `messages_${Date.now()}`;

        this.subscription = this.supabase.client
            .channel(channelName)
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'messages' },
                (payload) => {
                    // ACA TODOS RECIBEN EL MENSAJE QUE SE INSERTA
                    console.log('Nuevo mensaje recibido:', payload); // ######### CONSOLA
                    const newMessage = payload.new as ChatMessage;
                    const currentMessages = this.messagesSubject.value;
                    this.messagesSubject.next([...currentMessages, newMessage]);
                }
            )
            .subscribe((status) => { // Ahora se activa la suscripcion - antes no lo hacia
                console.log('Estado de suscripción:', status); // ######### CONSOLA
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Conectado al chat en tiempo real!'); // ######### CONSOLA
                }
                if (status === 'CLOSED') {
                    console.error(' Canal cerrado inesperadamente');
                }
            });
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
        console.log('Limpiando suscripción del chat');
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

    // testRealtime() {
    //     console.log('Testeando Realtime...');
        
    //     const testChannel = this.supabase.client
    //         .channel('test_channel')
    //         .on('postgres_changes',
    //             { event: '*', schema: 'public', table: 'messages' },
    //             (payload) => {
    //                 console.log(' REALTIME FUNCIONA!', payload);
    //             }
    //         )
    //         .subscribe((status) => {
    //             console.log('Test channel status:', status);
    //         });
    // }

}