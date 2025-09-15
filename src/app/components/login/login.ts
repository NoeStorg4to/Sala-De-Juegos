import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ FormsModule, RouterModule ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  testUsers = [
    { email: 'test1@example.com', password: 'password1', description: 'Usuario Básico' },
    { email: 'test2@example.com', password: 'password2', description: 'Usuario Premium' },
    { email: 'test3@example.com', password: 'password3', description: 'Usuario Admin' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const result = await this.authService.login(this.email, this.password);

      if (result.error) {
        this.errorMessage = this.getErrorMessage(result.error.message);
      } else {
        this.successMessage = 'Login exitoso!...'
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      }
    } catch (error) {
      this.errorMessage = 'Error inesperado. Por favor intenta nuevamente';
      console.error('Error en login:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithTestUser(user: {email: string, password: string}) {
    this.isLoading = true;
    this.errorMessage = '';
    
    const result = await this.authService.login(user.email, user.password);
    
    if (result.error) {
      this.errorMessage = this.getErrorMessage(result.error.message);
    }
    this.isLoading = false;

    // this.email = user.email;
    // this.password = user.password;
    // await this.onSubmit();
  }

  private getErrorMessage(error: string): string {
    if (error.includes('Invalid login credentials')) {
      return 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
    } else if (error.includes('Email not confirmed')) {
      return 'Por favor, confirma tu email antes de iniciar sesión.';
    } else {
      return 'Error al iniciar sesión. Por favor, intenta nuevamente.';
    }
  }

  // METODO PARA LIMPIAR MENSAJES?? 
  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
