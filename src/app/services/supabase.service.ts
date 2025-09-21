import { Injectable } from "@angular/core";
import { environment } from "../../enviroments/enviroment";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Router } from "@angular/router";
import { ValidateService } from "./validate.service";


export interface UserProfile {
    id: string;
    username: string;
    name: string;
    lastname: string;
    age: number;
    score: number;
    created_at: string;
}

export interface GameScore {
    id?: string;
    user_id: string;
    game_name: string;
    score: number;
    level: number;
    play_date: string;
    created_at: string;
    updated_at: string;
}

@Injectable({
    providedIn: 'root'
})

export class SupabaseService {
    private supabase: SupabaseClient;
    

    constructor(private router: Router, private validationService: ValidateService) {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
        auth: {
            persistSession: false,  
            autoRefreshToken: false 
            }
        });
    }

    get client() {
        return this.supabase;
    }

    get user() {
        return this.supabase.auth.getUser();
    }

    get session() {
        return this.supabase.auth.getSession();
    }

    authChanges(callback: (event: any, session: any) => void) {
        return this.supabase.auth.onAuthStateChange(callback);
    }


    async signIn(email: string, password: string): Promise<{ data: any; error: any }>{
        
        try {
            const { data, error} = await this.supabase.auth.signInWithPassword({
                email, 
                password
            });

            if (error) {
                console.error('Login failed:', error.message);
                return { data: null, error };
            }
            console.log('Login successful for:', data.user?.email);
            this.router.navigate(['/home']);
            return { data, error: null };
        } catch(error: any) {
            console.error('SignIn error:', error);
            return { data: null, error };
        }
    }

    // REGISTRO DE NUEVO USUARIO Y CREA EL PERFIL
    async signUp(email: string, password: string, userData: { name: string; lastname: string; age: number }): Promise<{ data: any; error: any }> {
        try {
            console.log('Registrando usuario en Auth...');
            const { data: authData, error: authError } = await this.supabase.auth.signUp({ 
                email,
                password,
            });

            if (authError) {
                console.error('Error en auth:', authError);
                return { data: null, error: authError };
            }

            if (!authData.user) {
                const error = new Error('No se pudo crear el usuario');
                return { data: null, error };
            }

            await this.createUserProfile(authData.user.id, userData);
            console.log(' Perfil creado exitosamente');

            const loginResult = await this.signIn(email, password);

            if (loginResult.error) {
                console.warn('Registro exitoso pero auto-login falló:', loginResult.error);
            } else {
                console.log('✅ Auto-login exitoso');
            }

            return { data: authData, error: null };
        } catch (error: any) {
            console.error('Error en registro:', error);
            if (error.message?.includes('already registered')) {
                error.message = 'El usuario ya se encuentra registrado';
            }
            return { data: null, error };
        }
    }

    private async createUserProfile(userId: string, userData: { name: string; lastname: string; age: number }
    ): Promise<void> {
        const profileData: Omit<UserProfile, 'id'> & { id: string } = {
            id: userId,
            username: this.validationService.generateUsername(userData.name, userData.lastname),
            name: userData.name,
            lastname: userData.lastname,
            age: userData.age,
            score: 0,
            created_at: new Date().toISOString()
        };

        const { error: profileError } = await this.supabase
            .from('profiles')
            .insert(profileData);

        if (profileError) {
            console.error('Error creating profile:', profileError);
            console.warn('Usuario creado en auth pero falló creación de perfil. Considera limpiar auth.');
            throw profileError;
        }
    }

    async signOut(): Promise<{ error: any }>{
        const result = await this.supabase.auth.signOut();
        this.router.navigate(['/home']);
        return result;
    }

    // OBTIENE EL PERFIL DE USUARIO POR ID
    async getUserProfile(userId: string): Promise<UserProfile>{
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            throw error;
        }
    }

    // ACTUALIZA EL PERFIL DEL USUARIO
    async updateUserProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>): Promise<UserProfile> {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single(); //--> con esto devuelvo un objeto directamente. Y me asegura un resultado

            if (error) throw error;
            return data as UserProfile;
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            throw error;
        }
    }

    // PARA GUARDAR PUNTUACION
    async saveGameScore(gameName: string, score: number, level: number = 1): Promise<GameScore>{
        try {
            const { data: { user } } = await this.user;
            
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            const gameScoreData: Omit<GameScore, 'id'> = {
                user_id: user.id,
                game_name: gameName,
                score,
                level,
                play_date: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('game_scores')
                .insert(gameScoreData)
                .select()
                .single();

            if (error) throw error;
            return data as GameScore;
        } catch (error) {
            console.error('Error guardando puntuación:', error);
            throw error;
        }
    }

    // MEJORES PUNTUACIONES
    async getUserHighScores(userId: string, limit: number = 10): Promise<GameScore[]> {
        try {
            const { data, error } = await this.supabase
                .from('game_scores')
                .select('*')
                .eq('user_id', userId)
                .order('score', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data as GameScore[];
        } catch (error) {
            console.error('Error obteniendo puntuaciones:', error);
            throw error;
        }
    }
}