import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;


  testUsers = [
    { email: 'test1@example.com', password: 'password1', description: 'Usuario Básico' },
    { email: 'test2@example.com', password: 'password2', description: 'Usuario Premium' },
    { email: 'test3@example.com', password: 'password3', description: 'Usuario Admin' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    
    const result = await this.authService.login(this.email, this.password);
    
    if (result.error) {
      this.errorMessage = this.getErrorMessage(result.error.message);
    }
    
    this.isLoading = false;
  }

  async loginWithTestUser(user: {email: string, password: string}) {
    this.isLoading = true;
    this.errorMessage = '';
    
    const result = await this.authService.login(user.email, user.password);
    
    if (result.error) {
      this.errorMessage = this.getErrorMessage(result.error.message);
    }
    
    this.isLoading = false;
  }

  getErrorMessage(error: string): string {
    if (error.includes('Invalid login credentials')) {
      return 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
    } else if (error.includes('Email not confirmed')) {
      return 'Por favor, confirma tu email antes de iniciar sesión.';
    } else {
      return 'Error al iniciar sesión. Por favor, intenta nuevamente.';
    }
  }
}
