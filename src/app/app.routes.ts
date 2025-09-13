import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Home } from './components/home/home';
import { QuienSoy } from './components/quien-soy/quien-soy';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'registro', component: Registro },
    { path: 'home', component: Home },
    { path: 'quien-soy', component: QuienSoy },
    // ------------ RUTAS DE JUEGOS ACA ------------------
    { path: '**', redirectTo: '/home' }
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }