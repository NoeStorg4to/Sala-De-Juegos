import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule],
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
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    if (this.userData.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }
    
    if (this.userData.age && (this.userData.age < 1 || this.userData.age > 120)) {
      this.errorMessage = 'La edad debe ser válida';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      const result = await this.authService.register(
        this.userData.email, 
        this.userData.password, 
        {
          name: this.userData.name,
          lastname: this.userData.lastname,
          age: this.userData.age
        }
      );
      
      if (result.error) {
        this.handleError(result.error);
      }
    } catch (error) {
      this.errorMessage = 'Error inesperado. Por favor, intenta nuevamente.';
    }
    
    this.isLoading = false;
  }

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
}
