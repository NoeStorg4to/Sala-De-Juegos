import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { SupabaseService } from "./supabase.service";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser = this.currentUserSubject.asObservable();
    constructor(private supabase: SupabaseService, private router: Router) {
        this.loadUser();
        this.supabase.authChanges((event, session) => {
        if (session?.user) {
            this.currentUserSubject.next(session.user);
        } else {
            this.currentUserSubject.next(null);
        }
        });
    }
    async loadUser() {
        const { data: { user } } = await this.supabase.user;
        this.currentUserSubject.next(user);
    }
    async login(email: string, password: string): Promise<{error: any}> {
        const { data, error } = await this.supabase.signIn(email, password);

        if (error) {
            return { error };
        }

        this.currentUserSubject.next(data!.user);
        this.router.navigate(['/home']);
        return { error: null };
    }
    async register(email: string, password: string, userData: any): Promise<{error: any}> {
        const { data, error } = await this.supabase.signUp(email, password, userData);

        if (error) {
            return { error };
        }

        this.currentUserSubject.next(data!.user);
        this.router.navigate(['/home']);
        return { error: null };
    }
    async logout(): Promise<void> {
        await this.supabase.signOut();
        this.currentUserSubject.next(null);
        this.router.navigate(['/home']);
    }
    getCurrentUser() {
        return this.currentUserSubject.value;
    }
    isAuthenticated(): boolean {
        return this.currentUserSubject.value !== null;
    }
}