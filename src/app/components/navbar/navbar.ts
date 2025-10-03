import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CapitalizePipe } from '../../pipes/pipe.capitalize';
import { Subscription } from 'rxjs';
import { ShowIfAuthDirective } from '../../directives/show-if-auth.directive';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, CapitalizePipe, ShowIfAuthDirective],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy{
  currentUser: any = null;
  currentProfile: any = null;
  private authSubscription!: Subscription;
  constructor(private router: Router, public authService: AuthService) {}

  ngOnInit() {
    this.authSubscription = this.authService.authState$.subscribe(authState => {
      this.currentUser = authState.user;
      this.currentProfile = authState.profile;
    });
  }

  ngOnDestroy() { //limpiar la subscripcion allways
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  navigateTo(route: string) {
    console.log('Navegando a:', route);
    this.router.navigate([route]);
  }

  logout () {
    this.authService.logout();
  }
}
