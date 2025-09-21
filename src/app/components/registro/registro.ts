import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormErrors, UserRegistrationData, ValidateService } from '../../services/validate.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})

export class Registro implements OnDestroy{
  userData: UserRegistrationData = {
    email: '',
    password: '',
    name: '',
    lastname: '',
    age: null
  };
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  fieldErrors!: FormErrors; // MUESTRO ERRORES ESPECIFICOS POR CAMPO

  // DESUSCRIPCION AUTOMATICA PARA EVITAR FUGAS DE MEMORIA (MEMORY LEAKS) -  VA A DESTRUIR EL COMPONENTE SI SE CIERRA LA PAG
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router, private validateService: ValidateService) {
    this.fieldErrors = this.validateService.clearFormErrors();
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        if (authState.isAuthenticated && this.isLoading) {
          console.log('Usuario autenticado, redirigiendo...');
          this.handleSuccessfulRegistration();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Avisa a todas las suscripciones
    this.destroy$.complete(); // NO OLVIDAR -  limpia recursos y complet el subjeCt
  }

  async onSubmit() {
    console.log('onSubmit() SE ESTÁ EJECUTANDO');
    this.clearMessages()

    if (!this.validateForm()) {
      console.log('Validación falló');
      return;
    }
    console.log('Validación OK, iniciando registro');
    this.isLoading = true;
    
    try {
      console.log('Llamando authService.register');
      const result = await this.authService.register(
        this.userData.email, 
        this.userData.password, 
        {
          name: this.userData.name,
          lastname: this.userData.lastname,
          age: this.userData.age
        }
      );
      console.log(' Resultado del register:', result);

      if (result.error) {
        console.log('Hay error en el registro:', result.error);
        this.errorMessage = this.validateService.mapSupabaseError(result.error);
      } else {
        console.log('Registro exitoso, mostrando mensaje');
        this.successMessage = '¡Registro exitoso! Revisa tu email para confirmar.';
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      this.errorMessage = 'Error inesperado. Por favor, intenta nuevamente.';
    } finally {
      console.log('Finalizando, isLoading = false');
      this.isLoading = false;
    }
  }

  private validateForm(): boolean {
    const validation = this.validateService.validateRegistrationForm(
      this.userData,
      this.confirmPassword
    );

    if (!validation.isValid) {
      this.fieldErrors = validation.errors;
      this.errorMessage = 'Por favor, corrige los errores en el formulario';
      return false;
    }
    return true;
  }

  // MANEJADOR DE REGISTRO EXITOSO
  private handleSuccessfulRegistration(): void {
    setTimeout(() => {
      console.log('Redirigiendo a home tras registro exitoso...');
      this.router.navigate(['/home']);
    }, 1500);
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = this.validateService.clearFormErrors();
  }

  clearFieldError(field: keyof FormErrors): void {
    this.fieldErrors[field] = '';
    if (Object.values(this.fieldErrors).every(error => !error)) { //Limpia mensaje general si no hay errores de campo
      this.errorMessage = '';
    }
  }

  // ----------- VALIDACIONES EN TIEMPO REAL PARA QUE LO  VISUALICE EL USUARIO
  getUsernamePreview(): string {
    return this.validateService.generateUsername(
      this.userData.name,
      this.userData.lastname
    );
  }

  onEmailChange() {
    this.clearFieldError('email');
    if (this.userData.email) {
      const validation = this.validateService.validateEmail(this.userData.email);
      if (!validation.isValid) {
        this.fieldErrors['email'] = validation.message;
      }
    }
  }

  onPasswordChange() {
    this.clearFieldError('password');

    if (this.userData.password) {
      const validation = this.validateService.validatePassword(this.userData.password);
      if (!validation.isValid) {
        this.fieldErrors['password'] = validation.message;
      }
    }
  }

  onConfirmPasswordChange(): void {
    this.clearFieldError('confirmPassword');
    this.validatePasswordConfirmation();
  }

  onNameChange() {
    this.clearFieldError('name');
    if (this.userData.name) {
      const validation = this.validateService.validateName(this.userData.name, 'nombre');
      if (!validation.isValid) {
        this.fieldErrors['name'] = validation.message;
      }
    }
  }

  onLastnameChange() {
    this.clearFieldError('lastname');
    if (this.userData.lastname) {
      const validation = this.validateService.validateName(this.userData.lastname, 'apellido');
      if (!validation.isValid) {
        this.fieldErrors['lastname'] = validation.message;
      }
    }
  }

  onAgeChange() {
    this.clearFieldError('age');
    if (this.userData.age) {
      const validation = this.validateService.validateAge(this.userData.age);
      if (!validation.isValid) {
        this.fieldErrors['age'] = validation.message;
      }
    }
  }

  private validatePasswordConfirmation(): void {
    const validation = this.validateService.validatePasswordConfirmation(
      this.userData.password,
      this.confirmPassword
    );
    
    if (!validation.isValid) {
      this.fieldErrors['confirmPassword'] = validation.message;
    }
  }
}
