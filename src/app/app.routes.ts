import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Home } from './components/home/home';
import { QuienSoy } from './components/quien-soy/quien-soy';
import { authGuard } from './guards/auth-guard';
import { AhorcadoGame } from './components/ahorcado-game/ahorcado-game';
import { MayorMenorGame } from './components/mayor-menor.game/mayor-menor.game';
import { SalaChat } from './components/sala.chat/sala.chat';
import { ageRestrictionGuard } from './guards/age-guard';
import { Preguntados } from './components/preguntados/preguntados';
import { AdivinaNumero } from './components/adivina-numero/adivina-numero';
import { Ranking } from './components/ranking/ranking';



// export const routes: Routes = [
//     { path: '', redirectTo: '/home', pathMatch: 'full' },
//     { path: 'login', component: Login, canActivate:[authGuard] }, 
//     { path: 'registro', component: Registro, canActivate:[authGuard] },
//     { path: 'home', component: Home },
//     { path: 'quien-soy', component: QuienSoy },

//     { path: 'ahorcado', component: AhorcadoGame, canActivate: [ageRestrictionGuard] },
//     { path: 'mayorMenor', component: MayorMenorGame },
//     { path: 'preguntados', component: Preguntados, canActivate:[authGuard] },
//     { path: 'adivina-numero', component: AdivinaNumero, canActivate:[authGuard] },

//     { path: 'ranking', component: Ranking},
    
//     { path: 'chat', component: SalaChat },

//     { path: '**', redirectTo: '/home' }
// ];

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