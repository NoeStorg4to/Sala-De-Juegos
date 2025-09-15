import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  userData = {
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

  // MUESTRO ERRORES ESPECIFICOS POR CAMPO
  fieldErrors = {
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    lastname: '',
    age: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    console.log('onSubmit() SE ESTÁ EJECUTANDO');
    this.clearMessages()

    if (!this.validateForm()) {
      console.log('2. Validación falló');
      return;
    }
    console.log('3. Validación OK, iniciando registro');
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    try {
      console.log('4. Llamando authService.register');
      const result = await this.authService.register(
        this.userData.email, 
        this.userData.password, 
        {
          name: this.userData.name,
          lastname: this.userData.lastname,
          age: this.userData.age
        }
      );
      console.log('5. Resultado del register:', result);

      if (result.error) {
        console.log('6. Hay error:', result.error);
        this.handleError(result.error);
      } else {
        console.log('7. Registro exitoso, mostrando mensaje');
        this.successMessage = '¡Registro exitoso! Revisa tu email para confirmar.';

        console.log('8. Verificando autenticación');

        setTimeout(() => {
          console.log('9. Ejecutando redirección...');
          this.router.navigate(['/home']);
          console.log('click en registrar-- Redirigiendo a home')
        }, 2000);
      }
    } catch (error) {
      console.error('10. Error catch:', error);
      this.errorMessage = 'Error inesperado. Por favor, intenta nuevamente.';
    } finally {
      console.log('11. Finalizando, isLoading = false');
      this.isLoading = false;
    }
    
    
  }

  // ########### OPTIMIZAR EN UN ARCHIVO VALIDACIONES.TS ###############
  private validateForm(): boolean {
    let isValid = true;

    // Validar email
    if (!this.userData.email) {
      this.fieldErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!this.isValidEmail(this.userData.email)) {
      this.fieldErrors.email = 'Ingresa un email válido';
      isValid = false;
    }

    // Validar contraseña
    if (!this.userData.password) {
      this.fieldErrors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (this.userData.password.length < 6) {
      this.fieldErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    } else if (!this.isStrongPassword(this.userData.password)) {
      this.fieldErrors.password = 'La contraseña debe tener al menos una letra y un número';
      isValid = false;
    }

    // Validar confirmación de contraseña
    if (!this.confirmPassword) {
      this.fieldErrors.confirmPassword = 'Confirma tu contraseña';
      isValid = false;
    } else if (this.userData.password !== this.confirmPassword) {
      this.fieldErrors.confirmPassword = 'Las contraseñas no coinciden';
      this.errorMessage = 'Las contraseñas no coinciden';
      isValid = false;
    }

    // Validar nombre
    if (!this.userData.name) {
      this.fieldErrors.name = 'El nombre es requerido';
      isValid = false;
    } else if (this.userData.name.trim().length < 2) {
      this.fieldErrors.name = 'El nombre debe tener al menos 2 caracteres';
      isValid = false;
    } else if (!this.isValidName(this.userData.name)) {
      this.fieldErrors.name = 'El nombre solo debe contener letras y espacios';
      isValid = false;
    }

    // Validar apellido
    if (!this.userData.lastname) {
      this.fieldErrors.lastname = 'El apellido es requerido';
      isValid = false;
    } else if (this.userData.lastname.trim().length < 2) {
      this.fieldErrors.lastname = 'El apellido debe tener al menos 2 caracteres';
      isValid = false;
    } else if (!this.isValidName(this.userData.lastname)) {
      this.fieldErrors.lastname = 'El apellido solo debe contener letras y espacios';
      isValid = false;
    }

    // Validar edad
    if (!this.userData.age) {
      this.fieldErrors.age = 'La edad es requerida';
      isValid = false;
    } else if (this.userData.age < 13) {
      this.fieldErrors.age = 'Debes tener al menos 13 años para registrarte';
      isValid = false;
    } else if (this.userData.age > 120) {
      this.fieldErrors.age = 'Ingresa una edad válida';
      isValid = false;
    }

    // Mostrar mensaje general si hay errores
    if (!isValid) {
      this.errorMessage = 'Por favor, corrige los errores en el formulario';
    }

    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  }

  private isStrongPassword(password: string): boolean {
    // Al menos una letra y un número
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
  }

  private isValidName(name: string): boolean {
    // Solo letras, espacios, acentos y ñ
    const nameRegex = /^[a-zA-ZÀ-ÿñÑ\s]+$/;
    return nameRegex.test(name.trim());
  }
  // ###########################################################

  // ################ OPTIMIZAR
  handleError(error: any) {
    if (error.message.includes('already registered')) {
      this.errorMessage = 'Este email ya está registrado. Por favor, inicia sesión.';
    } else if (error.message.includes('Password should be at least')) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
    } else if (error.message.includes('Invalid email')) {
      this.errorMessage = 'Por favor, ingresa un email válido.';
    } else {
      this.errorMessage = 'Error al registrar. Por favor, intenta nuevamente.';
    }
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      lastname: '',
      age: ''
    };
  }

  clearFieldError(field: keyof typeof this.fieldErrors) {
    this.fieldErrors[field] = '';
    if (Object.values(this.fieldErrors).every(error => !error)) {
      this.errorMessage = '';
    }
  }

  // ----------- VALIDACIONES EN TIEMPO REAL PARA QUE LO  VISUALICE EL USUARIO
  getUsernamePreview(): string {
    if (this.userData.name && this.userData.lastname) {
      return `${this.userData.name}${this.userData.lastname}`
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[àáäâ]/g, 'a')
        .replace(/[èéëê]/g, 'e')
        .replace(/[ìíïî]/g, 'i')
        .replace(/[òóöô]/g, 'o')
        .replace(/[ùúüû]/g, 'u')
        .replace(/ñ/g, 'n');
    }
    return '';
  }

  onEmailChange() {
    this.clearFieldError('email');
  }

  onPasswordChange() {
    this.clearFieldError('password');
    // Si ya hay confirmPassword, validar que coincidan
    if (this.confirmPassword && this.userData.password !== this.confirmPassword) {
      this.fieldErrors.confirmPassword = 'Las contraseñas no coinciden';
    } else {
      this.clearFieldError('confirmPassword');
    }
  }

  onConfirmPasswordChange() {
    this.clearFieldError('confirmPassword');
    if (this.userData.password !== this.confirmPassword) {
      this.fieldErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
  }

  onNameChange() {
    this.clearFieldError('name');
  }

  onLastnameChange() {
    this.clearFieldError('lastname');
  }

  onAgeChange() {
    this.clearFieldError('age');
  }
}
