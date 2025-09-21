import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  constructor(private router: Router, public authService: AuthService) {}

  navigateTo(route: string) {
    console.log('Navegando a:', route);
    this.router.navigate([route]);
  }

  logout () {
    this.authService.logout();
  }
}
