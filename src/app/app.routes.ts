import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { authGuard } from './guards/auth-guard';
import { ageRestrictionGuard } from './guards/age-guard';


export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    
    { path: 'login', loadComponent: () => import('./components/login/login').then(m => m.Login), canActivate: [authGuard] },
    { path: 'registro', loadComponent: () => import('./components/registro/registro').then(m => m.Registro), canActivate: [authGuard] },
    { path: 'home', loadComponent: () => import('./components/home/home').then(m => m.Home) },
    { path: 'quien-soy', loadComponent: () => import('./components/quien-soy/quien-soy').then(m => m.QuienSoy) },
    { path: 'ahorcado', loadComponent: () => import('./components/ahorcado-game/ahorcado-game').then(m => m.AhorcadoGame), canActivate: [ageRestrictionGuard] },
    { path: 'mayorMenor', loadComponent: () => import('./components/mayor-menor.game/mayor-menor.game').then(m => m.MayorMenorGame) },
    { path: 'preguntados', loadComponent: () => import('./components/preguntados/preguntados').then(m => m.Preguntados), canActivate: [authGuard] },
    { path: 'adivina-numero', loadComponent: () => import('./components/adivina-numero/adivina-numero').then(m => m.AdivinaNumero), canActivate: [authGuard] },
    { path: 'ranking', loadComponent: () => import('./components/ranking/ranking').then(m => m.Ranking) },
    { path: 'chat', loadComponent: () => import('./components/sala.chat/sala.chat').then(m => m.SalaChat) },
    
    { path: '**', redirectTo: '/home' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }