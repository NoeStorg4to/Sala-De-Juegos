import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';


export const authGuard: CanActivateFn = async (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  const isAuthRoute = state.url === '/login' || state.url === '/registro'

  //  SI ESTA AUTENTICADO Y QUIERE IR A LOGIN , REDIRIGIR A HOME (AUNQUE NO DEBERIAN MOSTRARSE)
  if (isAuthenticated && isAuthRoute){
    router.navigate(['/home']);
    return false;
  }

  // SI NO ESTA AUTENTICADO , REDIRIGE A LOGIN
  if(!isAuthenticated && !isAuthRoute) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
