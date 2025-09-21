import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { SupabaseService, UserProfile } from "./supabase.service";
import { BehaviorSubject, Observable } from "rxjs";

export interface AuthState {
    user: any | null;
    profile: UserProfile | null;
    isAuthenticated: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private authStateSubject = new BehaviorSubject<AuthState>({
        user: null,
        profile: null,
        isAuthenticated: false
    });

    // PARA USAR EL OBSERVABLE SOLO PARA LECTURA
    public authState$: Observable<AuthState> = this.authStateSubject.asObservable();

    constructor(
        private supabase: SupabaseService,
        private router: Router
    ) {
        this.initializeAuth();
    }

    private async initializeAuth(){
    // Carga primero el usuario
        await this.loadCurrentUser();
        this.supabase.authChanges((event, session) => { // Escuchar cambios en de la autenticacion si la misma cambia
            this.handleAuthChange(event, session);
        });
    }

    private async loadCurrentUser(){
        try {
            const { data: { user } } = await this.supabase.user;
            
            if (user) {
                const profile = await this.supabase.getUserProfile(user.id);
                this.updateAuthState(user, profile);
            } else {
                this.updateAuthState(null, null);
            }
        } catch (error) {
            console.error('Error loading current user:', error);
            this.updateAuthState(null, null);
        }
    }

    // MANEJADOR DE ERRORES DE AUTENTICACION
    private async handleAuthChange(event: string, session: any){
        if (session?.user) {
            try {
                const profile = await this.supabase.getUserProfile(session.user.id);
                this.updateAuthState(session.user, profile);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                this.updateAuthState(session.user, null);
            }
        } else {
            this.updateAuthState(null, null);
        }
    }

    private updateAuthState(user: any | null, profile: UserProfile | null){
        this.authStateSubject.next({
            user,
            profile,
            isAuthenticated: !!user
        });
    }

    async login(email: string, password: string): Promise<{error: any}> {
        try {
            const result = await this.supabase.signIn(email, password);
            
            if (result.error) {
                return { error: result.error };
            }
            return { error: null };
        } catch (error) {
            console.error('Login error:', error);
            return { error };
        }
    }
    async register(email: string, password: string, userData: any): Promise<{error: any}> {
        try {
            const result = await this.supabase.signUp(email, password, userData);
            
            if (result.error) {
                return { error: result.error };
            }
            return { error: null };
        } catch (error) {
            console.error('Register error:', error);
            return { error };
        }
    }

    async logout(): Promise<void> {
        try {
            await this.supabase.signOut();
        } catch (error) {
            console.error('Logout error:', error);
            this.updateAuthState(null, null); // Forzar actualización del estado en caso de error
        }
    }

    getCurrentAuthState(): AuthState {
        return this.authStateSubject.value;
    }

    isAuthenticated(): boolean {
        return this.authStateSubject.value.isAuthenticated;
    }

    // OBTIENE USUARIO ACTUAL
    getCurrentUser(): any | null {
        return this.authStateSubject.value.user;
    }

    // OBTIENE EL PERFIL DEL USUARIO ACTUAL
    getCurrentProfile(): UserProfile | null {
        return this.authStateSubject.value.profile;
    }
}