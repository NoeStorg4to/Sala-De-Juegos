import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { inject } from '@angular/core';


export const authGuardGuard: CanActivateFn = async (route, state) => {

  const supaService = inject(SupabaseService);
  const router = inject(Router);
  const session = await supaService.session;

  const login = session ? true : false;

  if (login && (state.url === '/login' || state.url === '/registro') ) {
    router.navigate(['/home'])
  }

  if(!login && state.url !== '/login' && state.url !== '/registro') {
    router.navigate(['/login']);
  }

  

  return true;
};
