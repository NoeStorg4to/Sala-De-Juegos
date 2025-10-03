import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { AlertService } from '../services/alert.service';


export const ageRestrictionGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const alertService = inject(AlertService);

    console.log('Guard ejecutándose...'); //############### consola

    if (!authService.isAuthenticated()) { // Esta autenticado?
        console.log('Usuario NO autenticado'); //############### consola

        router.navigate(['/login']);
        return false;
    }

    const profile = authService.getCurrentProfile();
    console.log('Perfil obtenido:', profile); //############### consola

    if (!profile || !profile.age) { // Si no hay perfil Y no valida edad
        console.log('Perfil incompleto o sin edad'); //############### consola

        alertService.error(
            'No se pudo verificar tu edad. Por favor, completa tu perfil.',
            'Perfil incompleto'
        ).then(() => {
            router.navigate(['/home']);
        })
        return false;
    }

    if (profile.age < 18) {
        console.log(' Usuario menor de edad'); //############### consola
        alertService.error(
            'Hay que ser mayor de 18 años para acceder a este juego.',
            'Edad insuficiente.'
        )
        router.navigate(['/home']);
        return false;
    }

    console.log(' Acceso permitido'); //############### consola

    // PERMITE
    return true;
}
