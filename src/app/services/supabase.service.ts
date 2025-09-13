import { Injectable } from "@angular/core";
import { environment } from "../../enviroments/enviroment";
import { createClient, SupabaseClient } from "@supabase/supabase-js";



@Injectable({
    providedIn: 'root'
})

export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
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

    signIn(email: string, password: string) {
        return this.supabase.auth.signInWithPassword({ email, password });
    }

    signUp(email: string, password: string, userData: any) {
        return this.supabase.auth.signUp({
        email,
        password,
        options: {
            data: userData
        }
        });
    }

    signOut() {
        return this.supabase.auth.signOut();
    }
}