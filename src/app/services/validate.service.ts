import { Injectable } from "@angular/core";

export interface ValidationResult {
    isValid: boolean;
    message: string;
}

export interface FormErrors {
    [key: string]: string;
}

export interface UserRegistrationData {
    email: string;
    password: string;
    name: string;
    lastname: string;
    age: number | null;
}

@Injectable({
    providedIn: 'root'
})

export class ValidateService {

    // VALIDA MAIL
    validateEmail(email: string): ValidationResult {
    if (!email) {
        return { isValid: false, message: 'El email es requerido' };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email.trim())) {
        return { isValid: false, message: 'Ingresa un email válido' };
    }

    return { isValid: true, message: '' };
    }

    // VALIDA CONTRASEÑA SEGURA
    validatePassword(password: string): ValidationResult {
        if (!password) {
        return { isValid: false, message: 'La contraseña es requerida' };
        }

        if (password.length < 6) {
            return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
        }

        // Al menos una letra y un número
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
    
        if (!hasLetter || !hasNumber) {
            return { isValid: false, message: 'La contraseña debe tener al menos una letra y un número' };
        }
        return { isValid: true, message: '' };
    }

    // VALIDA LA CONFIRMACION DE CONTRASEÑA
    validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
        if (!confirmPassword) {
            return { isValid: false, message: 'Confirma tu contraseña' };
        }

        if (password !== confirmPassword) {
            return { isValid: false, message: 'Las contraseñas no coinciden' };
        }
        return { isValid: true, message: '' };
    }

// VALIDA NOMBRE Y APELLIDO
    validateName(name: string, fieldName: string = 'nombre'): ValidationResult {
        if (!name) {
            return { isValid: false, message: `El ${fieldName} es requerido` };
        }
        if (name.trim().length < 2) {
            return { isValid: false, message: `El ${fieldName} debe tener al menos 2 caracteres` };
        }
        // Solo letras, espacios, acentos y ñ
        const nameRegex = /^[a-zA-ZÀ-ÿñÑ\s]+$/;
        if (!nameRegex.test(name.trim())) {
            return { isValid: false, message: `El ${fieldName} solo debe contener letras y espacios` };
        }
        return { isValid: true, message: '' };
    }

    // VALIDA EDAD
    validateAge(age: number | null): ValidationResult {
        if (!age) {
            return { isValid: false, message: 'La edad es requerida' };
        }
        if (age < 13) {
            return { isValid: false, message: 'Debes tener al menos 13 años para registrarte' };
        }
        if (age > 120) {
            return { isValid: false, message: 'Ingresa una edad válida' };
        }
        return { isValid: true, message: '' };
    }

    // VALIDA TODO EL FORMS
    validateRegistrationForm(userData: UserRegistrationData, confirmPassword: string): { isValid: boolean; errors: FormErrors } {
        const errors: FormErrors = {};

        // Validar cada campo
        const emailValidation = this.validateEmail(userData.email);
        if (!emailValidation.isValid) {
            errors['email'] = emailValidation.message;
        }

        const passwordValidation = this.validatePassword(userData.password);
        if (!passwordValidation.isValid) {
            errors['password'] = passwordValidation.message;
        }

        const confirmPasswordValidation = this.validatePasswordConfirmation(userData.password, confirmPassword);
        if (!confirmPasswordValidation.isValid) {
            errors['confirmPassword'] = confirmPasswordValidation.message;
        }

        const nameValidation = this.validateName(userData.name, 'nombre');
        if (!nameValidation.isValid) {
            errors['name'] = nameValidation.message;
        }

        const lastnameValidation = this.validateName(userData.lastname, 'apellido');
        if (!lastnameValidation.isValid) {
            errors['lastname'] = lastnameValidation.message;
        }

        const ageValidation = this.validateAge(userData.age);
        if (!ageValidation.isValid) {
            errors['age'] = ageValidation.message;
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    generateUsername(name: string, lastname: string): string {
        if (!name || !lastname) return '';
        
        return `${name}${lastname}`
            .toLowerCase()
            .replace(/\s+/g, '')
            .normalize('NFD') // Descomponer caracteres acentuados
            .replace(/[\u0300-\u036f]/g, ''); // Remueve acentos
    }

    // ######################### OPTIMIZAR #######################
    // PARA MAPEAR ERRORES DE SUPA - ########## OPTIMIZAR, SE VE FEO ###########
    mapSupabaseError(error: any): string {
        if (!error?.message) return 'Error inesperado. Por favor, intenta nuevamente.';

        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes('already registered') || errorMessage.includes('user already registered')) {
            return 'Este email ya está registrado. Por favor, inicia sesión.';
        }

        if (errorMessage.includes('password should be at least')) {
            return 'La contraseña debe tener al menos 6 caracteres.';
        }

        if (errorMessage.includes('invalid email')) {
            return 'Por favor, ingresa un email válido.';
        }

        if (errorMessage.includes('weak password')) {
            return 'La contraseña es muy débil. Usa al menos una letra y un número.';
        }

        if (errorMessage.includes('signup is disabled')) {
            return 'El registro está temporalmente deshabilitado. Intenta más tarde.';
        }

        return 'Error al registrar. Por favor, intenta nuevamente.';
    }

    // MISMO MAPEO PARA EL LOGIN
    mapLoginError(error: any): string {
        if (!error?.message) return 'Error inesperado. Por favor, intenta nuevamente.';

        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid email or password')) {
            return 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
        }

        if (errorMessage.includes('email not confirmed')) {
            return 'Por favor, confirma tu email antes de iniciar sesión.';
        }

        if (errorMessage.includes('too many requests')) {
            return 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.';
        }

        if (errorMessage.includes('account is disabled')) {
            return 'Tu cuenta ha sido deshabilitada. Contacta al soporte.';
        }

        return 'Error al iniciar sesión. Por favor, intenta nuevamente.';
    }


    validateLoginCredentials(email: string, password: string): ValidationResult {
        if (!email || !password) {
            return { isValid: false, message: 'Por favor, completa todos los campos' };
        }
        const emailValidation = this.validateEmail(email);
            if (!emailValidation.isValid) {
            return emailValidation;
        }
        if (password.length < 1) {
            return { isValid: false, message: 'La contraseña es requerida' };
        }
        return { isValid: true, message: '' };
    }


    clearFormErrors(): FormErrors {
        return {
            email: '',
            password: '',
            confirmPassword: '',
            name: '',
            lastname: '',
            age: ''
        };
    }
}