import { Injectable } from "@angular/core";
import { environment } from "../../enviroments/enviroment";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Router } from "@angular/router";

// export interface AuthLog {
//     user_id: string;
//     action_type: 'login' | 'logout' | 'register';
//     timestamp: string;
//     ip_address?: string;
//     user_agent?: string;
//     success: boolean;
//     error_message?: string;
// }

export interface UserProfile {
    id: string;
    username: string;
    name: string;
    lastname: string;
    age: number;
    score: number;
    created_at: string;
}

@Injectable({
    providedIn: 'root'
})

export class SupabaseService {
    private supabase: SupabaseClient;

    constructor(private router: Router) {
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


    async signIn(email: string, password: string) {
        
        try {
            const { data, error} = await this.supabase.auth.signInWithPassword({
                email, 
                password
            });

            if (error) {
                console.error('Login failed:', error.message);
                throw error;
            }
            console.log('Login successful for:', data.user?.email);
            this.router.navigate(['/home']);
            return { data, error: null };
        } catch(error: any) {
            console.error('SignIn error:', error);
            return { data: null, error };
        }
    }

    async signUp(email: string, password: string, userData: any) {
        try {
            console.log('Registrando usuario en Auth...');
            const { data: authData, error: authError } = await this.supabase.auth.signUp({ 
                email,
                password,
            });

            if (authError) {
                console.error('Error en auth:', authError);
                throw authError;
            }
// ################ OPTIMIZAR #################33
            if (authData.user) {
                const profileData: Omit<UserProfile, 'id'> & { id: string } = {
                    id: authData.user.id,
                    username: `${userData.name}${userData.lastname}`.toLowerCase().replace(/\s+/g, ''),
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

            console.log(' Perfil creado exitosamente');

            const { error: signInError } = await this.supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
            // if (authData.user) {
            //     const { error: signInError } = await this.supabase.auth.signInWithPassword({
            //         email,
            //         password
            //     });

            if (!signInError) {
                console.warn('Registro exitoso pero auto-login falló:', signInError);
                this.router.navigate(['/home']);
            } else {
                console.log('✅ Auto-login exitoso');
            }
            return { data: authData, error: null };
            // }

            
        } catch(error: any) {
            console.error('Error en registro:', error);
            // Verificar si es error de usuario ya registrado
            if (error.message?.includes('already registered')) {
                error.message = 'El usuario ya se encuentra registrado';
            }
            return { data: null, error };
        }
    }

    async signOut() {
        const result = await this.supabase.auth.signOut();
        this.router.navigate(['/home']);
        return result;
    }

    async getUserProfile(userId: string) {
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

    // ############# AGREGAR METODO PARA ACTUALIZAR EL USUARIO??

    // -------------PARA GUARDAR PUNTUACION---????????
    async saveGameScore(gameName: string, score: number, level: number = 1) {
        try {
            const user = (await this.user).data.user;
            if (!user) throw new Error('Usuario no autenticado');

            const { data, error } = await this.supabase
                .from('game_scores')
                .insert({
                    user_id: user.id,
                    game_name: gameName,
                    score: score,
                    level: level,
                    play_date: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error guardando puntuación:', error);
            throw error;
        }
    }
}