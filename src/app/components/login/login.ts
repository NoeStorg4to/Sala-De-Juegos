import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ValidateService } from '../../services/validate.service';
import { CommonModule } from '@angular/common';

interface TestUser {
  email: string;
  password: string;
  description: string;
}


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ FormsModule, RouterModule, CommonModule ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  testUsers: TestUser[] = [
    { email: 'test1@example.com', password: 'password1', description: 'Usuario Básico' },
    { email: 'test2@example.com', password: 'password2', description: 'Usuario Premium' },
    { email: 'test3@example.com', password: 'password3', description: 'Usuario Admin' }
  ];

  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router, private validateService: ValidateService) {
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        if (authState.isAuthenticated && this.isLoading) {
          console.log('Usuario autenticado, redirigiendo...');
          this.handleSuccessfulLogin();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onSubmit(): Promise<void>{
    this.clearMessages();

    const validation = this.validateService.validateLoginCredentials(
      this.email, 
      this.password
    );

    if (!validation.isValid) {
      this.errorMessage = validation.message;
      return;
    }

    console.log('Credenciales válidas, procesando login...');
    await this.performLogin(this.email, this.password);
  }

  async loginWithTestUser(user: TestUser): Promise<void> {
    console.log(`Login con usuario de prueba: ${user.description}`);
    this.clearMessages();

    this.email = user.email;
    this.password = user.password;
    
    await this.performLogin(user.email, user.password);
  }

  private async performLogin(email: string, password: string): Promise<void> {
    this.isLoading = true;

    try {
      const result = await this.authService.login(email, password);

      if (result.error) {
        console.error('Error en login:', result.error);
        this.errorMessage = this.validateService.mapLoginError(result.error);
      } else {
        console.log('Login exitoso');
        this.successMessage = '¡Login exitoso! Bienvenido/a.';
      }
    } catch (error) {
      console.error('Error inesperado en login:', error);
      this.errorMessage = 'Error inesperado. Por favor, intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  private handleSuccessfulLogin(): void {
    setTimeout(() => {
      console.log('Redirigiendo a home tras login exitoso...');
      this.router.navigate(['/home']);
    }, 1000);
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
