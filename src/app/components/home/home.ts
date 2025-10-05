import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SalaChat } from '../sala.chat/sala.chat';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SalaChat],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit{
  isLoggedIn = false;
  userName: string | null = null;
  isChatOpen = false;
  isAuthenticated = false;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.authState$.subscribe(state => {
      this.isAuthenticated = state.isAuthenticated;
    })
  }

  ngOnInit(): void {
    this.authService.authState$.subscribe(authState => {
      this.isLoggedIn = authState.isAuthenticated;
      this.userName = authState.profile?.name || authState.user?.email || null;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  toggleChat() {
    if (this.isAuthenticated) {
      this.isChatOpen = !this.isChatOpen;
    } else {
      console.warn('Necesitas estar autenticado para usar el chat');
    }
    
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
