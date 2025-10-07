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



export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'login', component: Login, canActivate:[authGuard] }, 
    { path: 'registro', component: Registro, canActivate:[authGuard] },
    { path: 'home', component: Home },
    { path: 'quien-soy', component: QuienSoy },

    { path: 'ahorcado', component: AhorcadoGame, canActivate: [ageRestrictionGuard] },
    { path: 'mayorMenor', component: MayorMenorGame },
    { path: 'preguntados', component: Preguntados, canActivate:[authGuard] },
    { path: 'adivina-numero', component: AdivinaNumero },

    { path: 'ranking', component: Ranking},
    
    { path: 'chat', component: SalaChat },

    { path: '**', redirectTo: '/home' }
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }